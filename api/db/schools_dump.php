<?php
require_once('../namespace.php');

use Lib\Database\MySQL;

$institution_types = [
    'resmi' => './resmi.xml',
    'ozel_kurum' => './ozel_kurum.xml', 
    'meb_disi' => './meb_disi.xml',
    'universite' => './universiteler.xml'
];
$db = MySQL::connect();

foreach ($institution_types as $institution_type => $value) {

    $str = file_get_contents($value);
    $temp = mb_convert_encoding( $str, "UTF-8" );
    $xml = simplexml_load_string($temp) or die("Error: $value dosyası açılamıyor.");
    echo "Başladı.($institution_type)" . PHP_EOL;
    $i = 0;
    foreach ($xml->Table as $value) {

        $query = "INSERT INTO institutions (city, county, institution_type, institution_name, web_address) VALUES (:city, :county, :institution_type, :institution_name, :web_address)";
        $prepare = $db->prepare($query);
        $prepare = $prepare->execute([
            ':city' => $value->IL_ADI,
            ':county' => $value->ILCE_ADI,
            ':institution_type' => $institution_type,
            ':institution_name' => $value->KURUM_ADI,
            ':web_address' => $value->WEB_ADRES
        ]);

        if(!$prepare){
            echo "Error: Veritabanına yazılamadı.";
        }
        echo progressBar(++$i, count($xml)). " ekleniyor.";
    }
    echo PHP_EOL . "Tamamlandı.($institution_type)" . PHP_EOL;
}

echo "Tüm işlemler tamamlandı." . PHP_EOL;

function progressBar($done, $total) {
    $arrow = floor(($done / $total) * 20);
    $perc = floor(($done / $total) * 100);
    $left = 20 - $arrow + 1;
    $write = sprintf("\033[0G\033[2K[%'={$arrow}s>%-{$left}s] - $perc%% - $done/$total", "", "");
    fwrite(STDERR, $write);
}