import Head from 'next/head'
import Slider from '@/components/Slider/Slider'
import styles from '@/styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Jelly Slider</title>
        <meta name='description' content='Jelly Slider. Built by Cam Green' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.container}>
        <Slider />
      </main>
    </>
  )
}
