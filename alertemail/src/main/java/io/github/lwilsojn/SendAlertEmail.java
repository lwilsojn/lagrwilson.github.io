package io.github.lwilsojn;


import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

public class SendAlertEmail {


    public static void main(String[] args) {

        //gmail account for this is uiux@alluresecurity.com
        final String username = "uiux@alluresecurity.com";
        final String password = "X%D7Vj<Z1";

        Properties prop = new Properties();
        prop.put("mail.smtp.host", "smtp.gmail.com");
        prop.put("mail.smtp.port", "587");
        prop.put("mail.smtp.auth", "true");
        prop.put("mail.smtp.starttls.enable", "true"); //TLS

        // creates a new session with an authenticator
        Authenticator auth = new Authenticator() {
            public PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        };

        Session session = Session.getInstance(prop, auth);
        String content = null;


        try {

            Path filePath = Paths.get("alertemail.html");
                    try {
                        content = Files.readString(filePath);
                    } catch (IOException ioe) {
                        System.out.println("Unable to read alertemail.html");
                        return;
                    }

            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("lwilson@alluresecurity.com"));
            message.setRecipients(
                    Message.RecipientType.TO,
                    InternetAddress.parse("lwilson@alluresecurity.com, lucillewilsonallure@gmail.com, lwilsonallure@outlook.com, bmoore@alluresecurity.com, chris@alluresecurity.com")
            );
            message.setSubject("Alert Email With CSS");

            MimeBodyPart mimeBodyPart = new MimeBodyPart();
            mimeBodyPart.setContent(content, "text/html");

            Multipart multipart = new MimeMultipart();
            multipart.addBodyPart(mimeBodyPart);

            message.setContent(multipart);

            Transport.send(message);

            System.out.println("Done");

        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}

