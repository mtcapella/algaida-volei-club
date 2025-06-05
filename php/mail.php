<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email'], $data['name'], $data['dni'], $data['total_pago'], $data['docs'])) {
    http_response_code(400);
    echo 'Datos incompletos';
    exit;
}

$mail = new PHPMailer(true);
try {
    // Configuración del servidor SMTP de IONOS
    $mail->CharSet = 'UTF-8';
    $mail->isHTML(false);
    $mail->isSMTP();
    $mail->Host = 'smtp.ionos.es';
    $mail->SMTPAuth = true;
    $mail->Username = 'miqueltoni@algaidavoleiclub.es';
    $mail->Password = 'Volei2425';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    // Remitente y destinatario
    $mail->setFrom('miqueltoni@algaidavoleiclub.es', 'Algaida Club Volei');
    $mail->addAddress($data['email'], $data['name']);

    // Cuerpo del mensaje
    $mail->isHTML(false);
    $mail->Subject = "Justificante de inscripción - Algaida Volei Club";
    $mail->Body = "Hola {$data['name']},\n\nGracias por completar la inscripción.\n\nDNI: {$data['dni']}\nPago realizado: {$data['total_pago']} €\n\nAdjuntamos los documentos de registro.\n\nUn saludo,\nAlgaida Volei Club";

    // Adjuntar PDFs descargados de Firebase
    foreach ($data['docs'] as $index => $url) {
        $fileData = file_get_contents($url);
        if ($fileData === false) continue;

        $tmpPath = tempnam(sys_get_temp_dir(), "doc");
        file_put_contents($tmpPath, $fileData);
        $mail->addAttachment($tmpPath, "documento_$index.pdf");
    }

    $mail->send();
    echo 'Correo enviado correctamente';
} catch (Exception $e) {
    http_response_code(500);
    echo "Error al enviar el correo: {$mail->ErrorInfo}";
}
