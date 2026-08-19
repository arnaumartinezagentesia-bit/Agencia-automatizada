import React from 'react';
import Head from 'next/head';
import GameContainer from '../components/GameContainer';

const IndexPage = () => {
    return (
        <div style={{
            backgroundColor: '#1a1a1a',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <Head>
                <title>Trading Enterprise - Game</title>
                <meta name="description" content="Visual Frontend for Trading Enterprise" />
            </Head>

            <h1 style={{ marginBottom: '20px', fontSize: '2rem' }}>
                Trading Enterprise
            </h1>

            <GameContainer />

            <p style={{ marginTop: '20px', color: '#aaa' }}>
                Phaser Integration Verification
            </p>
        </div>
    );
};

export default IndexPage;
