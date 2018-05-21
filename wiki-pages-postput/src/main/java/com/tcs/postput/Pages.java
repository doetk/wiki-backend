package com.tcs.postput;


import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Objects;

import javax.persistence.Entity;
import javax.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;
import javax.persistence.Column;
import javax.persistence.Id;


@Entity
@Table(name="page")
public class Pages implements Serializable {
	@Id
	@Column(name="pageid")
	private String pageid;

	@Id
	@Column(name="revisionid")
	private int revisionid;
	
	@Column(name="title")
	private String title;
	
	//@CreationTimestamp
	@Generated(GenerationTime.INSERT)
	@Column(name="modified", insertable = false)	
	private Timestamp modified;
	
	@Column(name="author")
	private int author;
	
	@Column(name="pagedata")
	private String pagedata;
	
	public Pages() {
	}
	
	public Pages(String pageid, int revisionid, String title, Timestamp modified, int author, String pagedata) {
		this.setPageid(pageid);
		this.setRevisionid(revisionid);
		this.setTitle(title);
		this.setModified(modified);
		this.setAuthor(author);
		this.setPagedata(pagedata);
	}
	
	public Pages(String pageid, int revisionid, String title, int author) {
		this.setPageid(pageid.toUpperCase());
		this.setRevisionid(revisionid);
		this.setAuthor(author);
		this.setPagedata(" ");
		this.setTitle(title);
	}

	
	public Pages(String pageid, int revisionid, String title, int author, String content) {
		this.setPageid(pageid.toUpperCase());
		this.setRevisionid(revisionid);
		this.setAuthor(author);
		this.setPagedata(content);
		this.setTitle(title);
	}

	public Pages(String pageid, int revisionid){
		this.pageid = pageid;
		this.revisionid = revisionid;
	}

	public String getPagedata() {
		return pagedata;
	}

	public void setPagedata(String pagedata) {
		this.pagedata = pagedata;
	}

	public int getAuthor() {
		return author;
	}

	public void setAuthor(int author) {
		this.author = author;
	}

	public Timestamp getModified() {
		return modified;
	}

	public void setModified(Timestamp modified) {
		this.modified = modified;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public int getRevisionid() {
		return revisionid;
	}

	public void setRevisionid(int revisionid) {
		this.revisionid = revisionid;
	}

	public String getPageid() {
		return pageid;
	}

	public void setPageid(String pageid) {
		this.pageid = pageid;
	}

	public boolean equals(Object obj){
		if(obj == this){
			return true;
		}
		if(!(obj instanceof Pages)){
			return false;
		}
		Pages page = (Pages) obj;

		if(this.pageid.equals(page.pageid) && this.revisionid == page.revisionid){
			return true;
		}
		return false;
	}

	public int hashCode(){
		return Objects.hash(pageid, revisionid);
	}	
}