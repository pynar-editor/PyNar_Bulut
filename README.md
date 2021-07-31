# API DÖKÜMANTASYONU

```bash

api
└── user [HEADER: Authorization: "Bearer <TOKEN>"] -> Login ve Signup harici tüm uç noktalarda gereklidir.
    ├── file 
    │   ├── download 
    │   │   ├── [dosya_adı] [METHOD: POST, BODY: { "mac_address": string }]
    │   ├── remove 
    │   │   ├── [dosya_adı] [METHOD: POST, BODY: { "mac_address": string }]
    │   ├── upload [METHOD: POST, FILES: { "file": [.py uzantılı] }, BODY: { "mac_address": string }]
    │   └── uploadedFiles [METHOD: POST, BODY: { "mac_address": string }]
    ├── info [METHOD: POST, BODY: { "mac_address": string }]
    ├── login [METHOD: POST, BODY: { "email": string, "password": string, "mac_address": string, "network_name": string, "os_name": string, "os_version": string }]
    ├── logout [METHOD: POST, BODY: { "mac_address": string }] 
    └── signup [METHOD: POST, BODY: { "email": string, "password": string, "user_fullname": string }] 
```

# KONFİGÜRASYONLAR
### Veritabanı Ayarları

&emsp;&emsp;Ana dizinde bulunan config.php dosyası içerisinde, 5. satırda bulunan 'DATABASE_CONFIG' dosyasını kendi makinenize göre güncelleyiniz.

### JWT SECRET DEĞİŞKENİ

&emsp;&emsp;Oturum güvenliği için uygulama dağıtımından önce ana dizinde bulunan config.php dosyasının içerisinde, 12. satırda bulunan JWT_SECRET değişkenini eşsiz bir kimlik ile değiştirin. Tavsiye edilen en az 32 byte eşsiz bir değişken olmasıdır.

### YENİDEN URL YAZMAYI APACHE2 ÜZERİNDE AKTİFLEŞTİRMEK

Öncelikle sunucumuzda yeniden yazma kurallarını çözümleyecek servisi aktifleştirmeniz gerekiyor.

    sudo a2enmod rewrite

### Files ve Sessions dizinleri

'api' dizini altında aşağıdaki dizin hiyerarşisini oluşturunuz.

    api
      |-- chunks
            |-- files
            |-- sessions

Aşağıdaki kod yardımıyla gerçekleştirebilirsiniz.

    mkdir chunks && mkdir chunks/files && mkdir chunks/sessions

Daha sonrasında PHP'nin kullanıcısı olan www-data kullanıcısını dosyanın sahibi olarak atayınız.

    chown -R www-data:www-data chunks/

Son olarak da bu klasörü için sadece sahibine okuma, yazma ve çalıştırma yetkisi veriniz.

    chmod -R 700 chunks/

# SIFIRDAN UYGULAMAYI DAĞITMAK - UBUNTU 20.04 LTS

## APACHE2 KURULUMU

Ubuntu 20.04 LTS içerisinde varsayılan olarak apache2 modülü kurulu olarak gelir. Kontrol etmek için bash içerisinde;

    apache2 -v
    
komutunu girin ve çıkan sonuç aşağıdaki sonuca benzer olmalıdır.

    Server version: Apache/2.4.41 (Ubuntu)
    Server built:   2020-08-12T19:46:17
    
#### Apache2 MODÜLÜNÜ MANUEL KURMAK

Öncelikle sunucunuzda yeni güncellemeler mevcut ise onları güncelleyerek başlayın.

    sudo apt update
    sudo apt upgrade
    
Daha sonra 'apt' yardımı ile apache2 modülünü sunucunuza kurun.

    sudo apt install apache2
    
Kurulum başarıyla gerçekleştikten sonra apache2 modülünü etkinleştireceğiz.

    sudo systemctl is-enabled apache2.service

Komutunu girdiğinizde geriye 'enabled' yanıtı dönüyorsa aşağıdaki komutu geçebilirsiniz. Enabled gelmiyorsa;

    sudo systemctl enable apache2.service
    
Komutu ile apache2 modülünü etkinleştiriyoruz.

Kurulum tamamlandı servisinizin durumunu görmek için aşağıdaki komutu kullanabilirsiniz.

    sudo systemctl status apache2.service
    
Apache servisini başlatmak için;

    sudo systemctl start apache2.service
    
Apache servisini durdurmak için;

    sudo systemctl stop apache2.service
    
Apache servisini yeniden başlatmak için;

    sudo systemctl restart apache2.service
    
Apache servisini yeniden yüklemek için;

    sudo systemctl reload apache2.service
    sudo apt-get update
    sudo apt-get upgrade
## MYSQL KURULUMU

Web servisimiz MySQL uyumlu olduğu içinm server üzerine kuracağız.

    sudo apt update
    sudo apt install mysql-server

Kurulum tamamlandıktan sonra bir takım konfigürasyonlar yapacağız.
    
    sudo mysql_secure_installation

Karşınıza aşağıdaki gibi bir çıktı gelecek bu çıktılara sırasıyla, 'Y' ve '2' seçeneklerini seçerek ilerleyin.

    Securing the MySQL server deployment.

    Connecting to MySQL using a blank password.

    VALIDATE PASSWORD COMPONENT can be used to test passwords
    and improve security. It checks the strength of password
    and allows the users to set only those passwords which are
    secure enough. Would you like to setup VALIDATE PASSWORD component?

    Press y|Y for Yes, any other key for No: Y

    There are three levels of password validation policy:

    LOW    Length >= 8
    MEDIUM Length >= 8, numeric, mixed case, and special characters
    STRONG Length >= 8, numeric, mixed case, special characters and dictionary                  file

    Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG:
     2

Daha sonrasında güçlü bir parola girin. Gelecek sorulara 'Y' yanıtı vererek ilerleyebilirsiniz.(Sıfırdan bir kurulum yapılıyorsa)

Git repository ile sunucuya yüklediğiniz 'restfulapi.sql' dosyasını MySQL server içerisine dahil edeceğiz.

    1. Bash üzerinde 'mysql -u root -p' komutu ile mysql içerisine girin.
    2. Mysql içerisinde 'source /var/www/api/restfulapi.sql;' komutunu çalıştırın.
    3. Sorunsuz bir şekilde içeri aktarıldıysa 'SHOW DATABASES;' komutu ile listelediğinizde "restfulapi" veritabanını görebilirsiniz.
   
