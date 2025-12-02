import Game from "../components/Game";

export default function Home() {
    return (
        <div className="game-container">
            <header>
                <h1>Word Guessing Game</h1>
                <p className="subtitle">Can you guess the word?</p>
            </header>
            <main>
                <Game />
            </main>
        </div>
    );
}
