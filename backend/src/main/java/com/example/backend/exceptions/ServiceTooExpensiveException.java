package com.example.backend.exceptions;

public class ServiceTooExpensiveException extends RuntimeException{
    public ServiceTooExpensiveException(String message) { super(message); }
}
