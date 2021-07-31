const {Builder, By, Key, until} = require('selenium-webdriver');

const convert = require('xml-js');
const fs = require('fs');

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());


(async function getStyleLink(param = 1) {
    try {
        console.log("Veriler web sitesi üzerinden getiriliyor...");
		var driver = new webdriver.Builder().forBrowser('chrome').build();
        
        await driver.get('https://yoksis.yok.gov.tr/websitesiuygulamalari/harita/');

        let styleSelector = By.className('btn-danger btn');
        let searchBtn = await driver.findElement(styleSelector);
        const actions = driver.actions({async: true});
        await actions.move({origin:searchBtn}).click().perform();

        await driver.executeScript('document.body.style.zoom = "70%"');

        var XML = {
            Kurum_Arama: {
                Table: []
            }
        };
        let tbody = await driver.wait(until.elementLocated(By.xpath('/html/body/div[4]/div[2]/div/div/div/div[3]/table/tbody[1]')), 10000);

        let pageNumber = await driver.wait(until.elementLocated(By.xpath('/html/body/div[4]/div[2]/div/div/div/div[4]/div/ul/li[3]/span')), 10000);
        pageNumber = await pageNumber.getText();
        var re = new RegExp('[0-9]+', 'g');
        pageNumber = pageNumber.match(re);  
       
        for (let index = 1; index <= pageNumber; index++){    
            delete tbody;                    
            let tbody = await driver.findElement(By.xpath('/html/body/div[4]/div[2]/div/div/div/div[3]/table/tbody[1]'));
           
            var keys = {
                0: "KURUM_ADI",
                1: "WEB_ADRES",
                3: "TEL",
                4: "FAX",
                5: "ADRES",
                6: "IL_ADI"
            }
            

            let tr = await tbody.findElements(By.css('tr'));
            
            for(let e of tr){
               
                let i = 0;

                var Table = {
                    KURUM_ADI: null,
                    WEB_ADRES: null,
                    TEL: null,
                    FAX: null,
                    ADRES: null,
                    IL_ADI: null,
                };
                
                let td = await e.findElements(By.css('td'));
                for(let ex of td){

                    if(i == 2 || i == 6){
                        i++;
                    }
                    else if(i == 5){
                        let address = await ex.getAttribute("textContent");
                        Table[keys[i]] = address;

                        const regex = /[^ĞğÜüŞşİıÖöÇça-zA-Z]+/g;
                        address = address.replace(regex," ");
                        address = address.split(" ").reverse()[0];
                        let re = new RegExp('[ĞğÜüŞşİıÖöÇçA-Za-z]*');
                        let city = address.match(re);
                        Table[keys[i+1]] = city[0].toUpperCase();
                        break;
                    }else{
                        
                        Table[keys[i]] = await ex.getAttribute("textContent");
                        i++;
                    }
                }
                for(let key of Object.keys(Table))
                    if(['','-','- -'].includes(Table[key]))
                        delete Table[key];
                
                XML.Kurum_Arama.Table.push(Table);
            }

            if (index != pageNumber){
                var myfunction = () => document.querySelectorAll(".z-paging-button.z-paging-next")[1].click();
                await driver.executeScript(myfunction); 
                await driver.sleep(1000);
            }
            
                     
        }
        var options = {compact: true, ignoreComment: true, spaces: 4};
        let result = '<?xml version="1.0" encoding="UTF-8"?>\n';
        result += convert.json2xml(XML,options);

        fs.writeFile('universiteler.xml', result, { flag: 'w+' }, (err) => {
            if(err)
                return console.log("Dosya kaydedilirken hata oluştu.");
            console.log("Dosya başarıyla kaydedildi.");
        })

    } catch (error){
		console.log(error);
	}
    finally{
        driver.quit();
    }
})();