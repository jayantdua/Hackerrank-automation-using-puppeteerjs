//run as node Hackerrank.js --config=config.json --url=https://www.hackerrank.com

let minimist = require("minimist");
let args = minimist(process.argv);
let puppeteer = require("puppeteer");
let fs = require("fs");

let configJson = fs.readFileSync(args.config,"utf-8");
let config = JSON.parse(configJson);

async function run()
{
    let browser = await puppeteer.launch({
        headless:false,
        args:[
            '--start-maximized' // you can also use '--start-fullscreen'
         ],
         defaultViewport:null
    });
    let page = await browser.newPage();
    await page.goto(args.url);

    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']",config.username,{delay:30});
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']",config.password,{delay:30});
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    await page.waitForSelector("div.pagination > ul > li > a[data-attr1='Last']");
    let numPages = await page.$eval("div.pagination > ul > li > a[data-attr1='Last']",function(data){
        let np = parseInt(data.getAttribute('data-page'));
        return np;
    })
    for(let i=1;i<=numPages;i++)
    {
        await page.waitForSelector("a.backbone.block-center");
        let allContestsURL = await page.$$eval("a.backbone.block-center", function(contestURL){
        let urls=[];
        for(let i=0;i<contestURL.length;i++)
        {
            let link = contestURL[i].getAttribute("href");
            urls.push(link);
        }
        return urls;
        });
    
        let links=[];
        for(let i=0;i<allContestsURL.length;i++)
        {
            let link = args.url + allContestsURL[i];
            links.push(link);
        }
        await openNewTabAndAddModerator(links,browser);
        if(i!=numPages)
        {
            await page.waitForSelector("div.pagination > ul > li > a[data-attr1='Right']");
            await page.click("div.pagination > ul > li > a[data-attr1='Right']");
            await page.waitFor(5000);
            console.log("Hello");
        }
    }
    browser.close();
}
async function openNewTabAndAddModerator(links,browser)
{
    for(let i=0;i<links.length;i++)
    {
        let tab = await browser.newPage();
        tab.goto(links[i]);
        await tab.bringToFront();
        await tab.waitFor(5000);
        await addModerator(tab);
        await tab.waitFor(5000);
        await tab.close();
    }
}

async function addModerator(page)
{
    await page.waitForSelector("li[data-tab='moderators']");
    await page.click("li[data-tab='moderators']");

    await page.waitForSelector("input#moderator");
    await page.type("input#moderator",config.moderator,{delay:30});
    await page.keyboard.press('Enter');
}

run();
