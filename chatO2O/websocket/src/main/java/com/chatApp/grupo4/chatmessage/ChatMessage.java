package com.chatApp.grupo4.chatmessage;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class ChatMessage {
    @Id
    private String id;
    private String content;
    private String senderId;
    private String recipientId;
    private String chatId;
    private Date timestamp;
}
