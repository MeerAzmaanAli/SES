<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the form fields and remove whitespace
    $name = strip_tags(trim($_POST["name"] ?? ''));
    $phone = strip_tags(trim($_POST["phone"] ?? ''));
    $email = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $service = strip_tags(trim($_POST["service"] ?? ''));
    $location = strip_tags(trim($_POST["location"] ?? ''));
    $timeline = strip_tags(trim($_POST["timeline"] ?? ''));
    $message = trim($_POST["message"] ?? '');

    // Check that data was sent to the mailer.
    if ( empty($name) OR empty($phone) OR empty($email) ) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Please complete the form and try again."]);
        exit;
    }

    // Set the recipient email address.
    $recipient = "irshad@supremeengineeringservices.com";

    // Set the email subject.
    $subject = "New Enquiry from $name";

    // Build the email content.
    $email_content = "Name: $name\n";
    $email_content .= "Phone: $phone\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Service Needed: $service\n";
    $email_content .= "Project Location: $location\n";
    $email_content .= "Timeline: $timeline\n\n";
    $email_content .= "Message:\n$message\n";

    // Build the email headers.
    $headers = "From: SES Website <info@supremeengineeringservices.com>\r\n";
    $headers .= "Reply-To: $email\r\n";
    
    // Send the email.
    if (mail($recipient, $subject, $email_content, $headers)) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Thank You! Your message has been sent."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Oops! Something went wrong and we couldn't send your message."]);
    }
} else {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "There was a problem with your submission, please try again."]);
}
?>
