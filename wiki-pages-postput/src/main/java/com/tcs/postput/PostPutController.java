package com.tcs.postput;

import org.apache.commons.lang3.tuple.Pair;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.hibernate.type.StringType;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.Console;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


@RestController
@RequestMapping("/api/v1")
public class PostPutController {
	
	//Used to compare JSON files used in creating and editing pages for proper formatting
	private JSONArray postFormat = new JSONArray().put("title");
	private JSONArray putFormat = new JSONArray().put("content");
	private JSONArray deleteFormat = new JSONArray().put("revisionID");
		
	/*This method is for creating new pages that do not exist in the database
	* It receives a string that will be tested to see if it is JSON file and a string from a cookie that will be
	* used to test if the user is allowed to create a page */
	@RequestMapping(value="/pages", method=RequestMethod.POST, consumes="application/json" )
	@ResponseBody
	public ResponseEntity<Object> postPage(
			@RequestBody String content, 
			@RequestHeader(value = "uid") String tempuid, 
			@RequestHeader(value="authStatus") boolean authStatus
	) throws JSONException {
		// test for authorization of user
		if (!authStatus) {
			return new ResponseEntity<Object>( "You are not authorized to create this page.", HttpStatus.UNAUTHORIZED);
		}
		
		int uid = -1;
		try{
			uid = Integer.parseInt(tempuid);
		} catch (Exception err){
			return new ResponseEntity<Object>("UserID was not an int", HttpStatus.BAD_REQUEST );
		}
		// gets a boolean and a JSON object from a string
		Pair<Boolean, JSONObject> result = checkJSON(content);
		
		// if string was not a JSON object return bad request to user
		if(!(Boolean)result.getLeft()) {
			return new ResponseEntity<Object>(new ApiError("412", "No JSON"), HttpStatus.PRECONDITION_FAILED);
		}

		// checks the format of the JSON file to ensure it is correct.
		if (!checkFormat(result.getRight(), postFormat)) {
			return new ResponseEntity<Object>(new ApiError("406","Improper format for JSON Object"), HttpStatus.NOT_ACCEPTABLE);
		}

		Session s = HibernateUtil.getSessionFactory().getCurrentSession();
		s.beginTransaction();
		String title = result.getRight().getString("title").replaceAll("[^a-zA-Z0-9,-,(,)]", "");				
		
		Query query = s.createQuery("from Pages where title=:newTitle")
				.setParameter("newTitle", title.toLowerCase());
					
		int size = query.list().size();
		if (size != 0) {
			s.close();
			return new ResponseEntity<Object>(new ApiError("400" ,"Page Already Exists"), HttpStatus.BAD_REQUEST);
		}
		
		
		
		insertQuery(s, title, result.getRight().getString("title"), uid);
		//System.out.println(title + "\n" + result.getRight().getString("title"));
		// success, status of created along with the URl toward the newly created file is sent to the user
		
		
		addPageToGraph(result.getRight().getString("title"), title.toUpperCase(), uid);
		
		s.close();
		return  new ResponseEntity<Object>(new ApiError("201", "/api/v1/pages/" + title.toUpperCase()), HttpStatus.CREATED);
		// JSON file was not in the right format
	}
	
	//This method edits pages that exist in the database
	@RequestMapping(value="/pages/{id}", method=RequestMethod.PUT, consumes="application/json")
	public @ResponseBody ResponseEntity<Object> putPage(
	    @RequestBody String content, 
	    @PathVariable("id") String pageid,
	    @RequestHeader(value = "uid") String tempuid,
	    @RequestHeader(value="authStatus") boolean authStatus
	) throws JSONException {
		
		//Checks for Authorization
		if (!authStatus) {
			return new ResponseEntity<Object>(new ApiError("401", "You are not authorized to edit this page."), HttpStatus.UNAUTHORIZED);
		}
		int uid = -1;
		try{
			uid = Integer.parseInt(tempuid);
		} catch (Exception err){
			return new ResponseEntity<Object>(new ApiError("400", "UserID was not an int"), HttpStatus.BAD_REQUEST );
		}
		//checks for valid JSONOBject
		Pair<Boolean, JSONObject> result = checkJSON(content);
		if (!result.getLeft()) {
			return new ResponseEntity<Object>(new ApiError("400", "No JSON"), HttpStatus.BAD_REQUEST);
		}
		//checks for proper JSON format
		if(!checkFormat((JSONObject)result.getRight(), putFormat)) {
			return new ResponseEntity<Object>(new ApiError("406", "Improper format for JSON Object"), HttpStatus.NOT_ACCEPTABLE);
		}
		Session s = HibernateUtil.getSessionFactory().getCurrentSession();
		s.beginTransaction();
		Query query = s.createQuery("from Pages where pageid=:pageid")
				.setParameter("pageid", pageid.toUpperCase());
		int size = query.list().size();
		if (size == 0) {
			return new ResponseEntity<Object>(new ApiError("404", "Page does not exist."), HttpStatus.NOT_FOUND);
		}
		String check = ((Pages)query.list().get(size-1)).getPagedata();
		if (check.equals(result.getRight().getString("content"))){
			return new ResponseEntity<Object>(new ApiError("418", "No New Content Submitted"), HttpStatus.I_AM_A_TEAPOT);
		}
		Pages newest = insertQuery(s,((Pages) query.list().get(size-1)).getPageid(), ((Pages) query.list().get(size-1)).getTitle() , uid, size, result.getRight().getString("content"));
		
		addEditRelationshipToGraph(((Pages) query.list().get(size-1)).getPageid(), uid);
		
		s.getTransaction().commit();
		
		s.close();
		
		
		
	

		return new ResponseEntity<Object>(newest, HttpStatus.OK);
	}
	
	// Calls recommendation service to add page to graph
	public String addPageToGraph(String title, String pageid, Integer authorid) {
		
		RestTemplate restTemplate = new RestTemplate();

	    LinkedMultiValueMap<String, Object> payload = new LinkedMultiValueMap<>();
	    payload.add("title", title);
	    payload.add("pageid", pageid);
	    payload.add("author", authorid);

	    //add array
	    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("http://wiki-recommendation:6161/create/node/page");
	    
	    String result = "";
	    HttpHeaders headers = new HttpHeaders();
	    headers.setContentType(MediaType.APPLICATION_JSON);

	    HttpEntity<LinkedMultiValueMap<String, Object>> requestEntity =
	            new HttpEntity<>(payload, headers);

	    ResponseEntity<String> responseEntity = restTemplate.exchange(
	            builder.build().encode().toUri(),
	            HttpMethod.POST,
	            requestEntity,
	            String.class);

	    HttpStatus statusCode = responseEntity.getStatusCode();
	    if (statusCode == HttpStatus.ACCEPTED) {
	        result = responseEntity.getBody();
	    }
	    System.out.println(result);
	    return result;
	}
	
	// Calls recommendation service to add relationship to graph
	public String addEditRelationshipToGraph(String pageid, Integer userid) {
		
		RestTemplate restTemplate = new RestTemplate();

	    LinkedMultiValueMap<String, Object> payload = new LinkedMultiValueMap<>();
	    payload.add("pageid", pageid);
	    payload.add("userid", userid);

	    //add array
	    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("http://wiki-recommendation:6161/create/relationship/page/edit");
	    
	    String result = "";
	    HttpHeaders headers = new HttpHeaders();
	    headers.setContentType(MediaType.APPLICATION_JSON);

	    HttpEntity<LinkedMultiValueMap<String, Object>> requestEntity =
	            new HttpEntity<>(payload, headers);

	    ResponseEntity<String> responseEntity = restTemplate.exchange(
	            builder.build().encode().toUri(),
	            HttpMethod.POST,
	            requestEntity,
	            String.class);

	    HttpStatus statusCode = responseEntity.getStatusCode();
	    if (statusCode == HttpStatus.ACCEPTED) {
	        result = responseEntity.getBody();
	    }
	    System.out.println(result);
	    return result;
	}
	
	/*Checks to ensure that a string is actually a JSON file
	 * if string is a JSON file, it will return true and a JSON file created from the string
	 * if the string is not a JSON file it returns false along with a blank JSON file*/
	
	public Pair<Boolean, JSONObject> checkJSON(String check){
		Boolean bool;
		JSONObject json;
		try {
			json = new JSONObject(check);
			bool = new Boolean (true);
		} catch (JSONException e) {
			json = new JSONObject();
			bool = new Boolean(false);
		}
		return Pair.of(bool, json);
	}
	
	/*This method checks to see if the key strings of one JSON is the same as another.
	 * It is used to ensure that the JSON file from the user is properly formatted*/
	public Boolean checkFormat(JSONObject json, JSONArray format) {		
		return json.names().toString().equals(format.toString());
	}
	
	public void insertQuery(Session s, String pageid, String title, int author) {
		Pages pages = new Pages(pageid, 0, title, author);
		s.save(pages);
		s.getTransaction().commit();
		
	}
	
	public Pages insertQuery(Session s, String pageid, String title, int author, int revisionID, String content) {
		Pages pages = new Pages(pageid, revisionID, title, author, content);
		s.save(pages);
		s.flush();
		s.get(Pages.class, pages);
		return pages;
	}
	

}
