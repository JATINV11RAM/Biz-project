import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>BizSaathi - AI Assistant for Indian Small Businesses</title>
        <meta name="description" content="Professional AI tools for your business - WhatsApp Writer, Poster Maker, Profit Advisor, GST Helper, Review Replier" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>📱</text></svg>" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
