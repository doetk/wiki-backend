package com.tcs.postput;

import org.springframework.boot.autoconfigure.web.ErrorController;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
public class ErrorHandling implements ErrorController{

    private static final String PATH = "/error";

    @RequestMapping(value=PATH)
    public ResponseEntity<String> Errors(){
        return new ResponseEntity<String>("400 Bad Request", HttpStatus.BAD_REQUEST);
    }

    @Override
    public String getErrorPath() {
        return PATH;
    }
}