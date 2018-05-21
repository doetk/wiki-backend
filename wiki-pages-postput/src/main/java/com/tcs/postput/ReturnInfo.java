package com.tcs.postput;

import org.springframework.http.HttpStatus;

public class ReturnInfo {
	private final HttpStatus httpStatus;
	private final String content;
	
	public ReturnInfo(HttpStatus HttpStat, String message){
		httpStatus = HttpStat;
		content = message;
	}

	public HttpStatus getHttpStatus() {
		return httpStatus;
	}

	public String getContent() {
		return content;
	}

}
