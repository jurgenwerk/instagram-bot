import puppeteer from "puppeteer";

export default async function html2image(html: string): Promise<Buffer> {
  let browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  let page = await browser.newPage();
  await page.setViewport({
    width: 800,
    height: 800,
  });

  await page.setContent(html);

  let imageBuffer = await page.screenshot({ type: "jpeg", quality: 100 });

  await browser.close();

  return imageBuffer as Buffer;
}
