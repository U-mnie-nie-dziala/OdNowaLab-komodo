package com.example.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProviderChain;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClientBuilder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class CognitoConfig {

    private final CognitoProperties cognitoProperties;

    @Value("${aws.access-key-id:}")
    private String globalAccessKeyId;

    @Value("${aws.secret-access-key:}")
    private String globalSecretAccessKey;

    @Bean
    public CognitoIdentityProviderClient cognitoIdentityProviderClient() {
        String regionStr = StringUtils.hasText(cognitoProperties.getRegion())
                ? cognitoProperties.getRegion()
                : "eu-central-1";

        CognitoIdentityProviderClientBuilder builder = CognitoIdentityProviderClient.builder()
                .region(Region.of(regionStr));

        String keyId = StringUtils.hasText(cognitoProperties.getAccessKeyId())
                ? cognitoProperties.getAccessKeyId()
                : globalAccessKeyId;
        String secretKey = StringUtils.hasText(cognitoProperties.getSecretAccessKey())
                ? cognitoProperties.getSecretAccessKey()
                : globalSecretAccessKey;

        if (StringUtils.hasText(keyId) && StringUtils.hasText(secretKey)) {
            log.info("Configuring Cognito client with static AWS credentials.");
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(keyId, secretKey)
            ));
        } else {
            log.info("Configuring Cognito client with default credentials provider chain and anonymous fallback.");
            builder.credentialsProvider(AwsCredentialsProviderChain.builder()
                    .addCredentialsProvider(DefaultCredentialsProvider.create())
                    .addCredentialsProvider(AnonymousCredentialsProvider.create())
                    .build());
        }

        return builder.build();
    }
}
