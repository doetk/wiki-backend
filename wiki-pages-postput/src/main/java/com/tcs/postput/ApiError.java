package com.tcs.postput;

public class ApiError{
    private String errorMsg;
    private String errorCode;
    public ApiError(){
        errorCode = "404";
        errorMsg = "Page not found.";
    }
    public ApiError(String code, String msg){
        errorCode = code;
        errorMsg = msg;
    }
    public String getMsg(){
        return errorMsg;
    }
    public String getCode(){
        return errorCode;
    }
    public void setCode(String code){
        errorCode = code;
    }
    public void setMsg(String msg){
        errorMsg = msg;
    }
}