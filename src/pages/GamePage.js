import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/GamePage.css';

const games = [
  {
    id: 1,
    title: 'Binary Puzzle',
    description: 'İkili sayı sistemine dayalı düşünme geliştirme oyunu.',
    image: '/images/binary-puzzle.png',
    howToPlay: '0 ve 1 leri kurallara göre yerleştir. Satır ve sütunlarda tekrar yok.'
  },
  {
    id: 2,
    title: 'Sorting Visualizer',
    description: 'Sıralama algoritmalarını görselleştiren interaktif bir deneyim.',
    image: '/images/sorting-visualizer.png',
    howToPlay: 'Algoritmayı seç, başlat, gözlemle.'
  },
  {
    id: 3,
    title: 'Maze Solver',
    description: 'Labirentte çıkış yolu bulan algoritmaları keşfet.',
    image: '/images/maze-solver.png',
    howToPlay: 'Başlangıç ve bitiş noktalarını seç, çözüm yolunu izle.'
  }
];

function GamePage() {
  return (
    <div className="game-page">
      <h1>🎮 Oyun Merkezi</h1>
      <p>Algoritma odaklı oyunlarla öğrenmeyi pekiştir!</p>
      <div className="game-card-container">
        {games.map((game) => (
          <div key={game.id} className="game-card">
            <img src={game.image} alt={game.title} className="game-image" />
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <Link to={`/games/${game.id}`} className="play-button">Oyunu Aç</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GamePage;
