# GEREKSİNİMLER

- NodeJS ^14.15.1
- npm ^6.14.8

# KURULUM VE KULLANIM

## UBUNTU 20.04 için NodeJS 

    ## NODEJS KURULUMU
NODEJS KURARKEN ROOT KULLANICISI OLARAK OTURUM AÇIN  

NVM(Node Version Manager) kurulumu için çalıştırın.

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

NVM başarıyla kurulduktan sonra NVM'i kullanabilmek için aşağıdaki komutu çalıştırın ya da sunucunuzu yeniden başlatın.

    source ~/.bashrc
    
veya
    
    reboot
    
Daha sonra kuracağınız NodeJS sürümünü bulmak için aşağıdaki komutu çalıştırabilirsiniz.(Eğer sürümünüzü biliyorsanız komutu çalıştırmanıza gerek yok.)

    nvm ls-remote
    
Nodejs sürümünüzü bulduktan sonra aşağıdaki komut ile sunucunuza kurabilirsiniz.(V14.15.1 tavsiye edilir)

    nvm install <nodejs_sürümü>
    
NodeJS kurulduktan sonra 'node' komutu ile test edebilirsiniz.

NodeJS root için kurulduğunda diğer kullanıcıların da kullanabilmesini sağlamak için aşağıdaki betiği çalıştırın.

    n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local

## ARAÇ KURULUMU ve KULLANIMI

1. Bilgisayarınızın komut satırı arayüzünü açın.
2. Dizin değiştirerek deponun bulunduğu dizinin içine gelin.
3. Paketleri kurmak için öncelikle aşağıdaki komutu çalıştırın.

    npm i

4. Site üzerinde tarama yapmak için;

    node getUniversities.js    

    
5. İşlemler internet hızınıza, bilgisayarınızın özelliklerine ve sitenin isteklere yanıt verme hızına göre biraz uzun sürebilir.
