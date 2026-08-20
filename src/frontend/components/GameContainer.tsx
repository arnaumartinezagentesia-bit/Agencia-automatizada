import React, { useEffect, useRef } from 'react';

const GameContainer: React.FC = () => {
    const gameRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Phaser only on the client side
        if (typeof window !== 'undefined' && !gameRef.current) {
            // Dynamic import to ensure Phaser is only loaded in the browser
            import('../game/main').then((main) => {
                gameRef.current = main.initGame();
            });
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div
            id="phaser-game-container"
            style={{
                width: '800px',
                height: '600px',
                margin: '0 auto',
                border: '4px solid #333',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}
        />
    );
};

export default GameContainer;
