package com.example.backend.dtos.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Standard operation status message response")
public class MessageResponseDto {

    @Schema(description = "Status message", example = "Operation completed successfully")
    private String message;

    @Builder.Default
    @Schema(description = "Whether the operation succeeded", example = "true")
    private Boolean success = true;
}
