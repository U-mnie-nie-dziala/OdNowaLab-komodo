package com.example.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "aws.cognito")
@Getter
@Setter
public class CognitoProperties {

    private String userPoolId;
    private String clientId;
    private String region = "eu-central-1";
    private String accessKeyId;
    private String secretAccessKey;

    public String getClientId() {
        return (clientId != null && !clientId.isBlank()) ? clientId : null;
    }

    public String getUserPoolId() {
        return (userPoolId != null && !userPoolId.isBlank()) ? userPoolId : null;
    }

    public String getRegion() {
        return (region != null && !region.isBlank()) ? region : "eu-central-1";
    }

    public String getAccessKeyId() {
        return (accessKeyId != null && !accessKeyId.isBlank()) ? accessKeyId : null;
    }

    public String getSecretAccessKey() {
        return (secretAccessKey != null && !secretAccessKey.isBlank()) ? secretAccessKey : null;
    }
}
