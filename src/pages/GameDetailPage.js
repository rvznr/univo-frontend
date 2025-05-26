// GameDetailPage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/GameDetailPage.css';

const gameData = [
  {
    id: 1,
    title: 'Bubble Sort Visualizer',
    image: '/images/bubble_sort.png',
    description: 'Sürükleyerek dizileri sırala. Sıralama algoritmalarını öğren!',
    howToPlay: 'Elemanları küçükten büyüğe doğru sürükleyin. Tüm dizi sıralandığında kazanırsınız.',
    iframe: 'https://yourdomain.com/games/bubble-sort.html'
  },
  {
    id: 2,
    title: 'Binary Search Tree Game',
    image: '/images/bst.png',
    description: 'Ağaç yapısını oluşturarak doğru aramayı keşfet.',
    howToPlay: 'Rakamları tıklayarak BST kurun. Hedef sayıyı en kısa adımda bulun.',
    iframe: 'https://yourdomain.com/games/bst.html'
  }
];

function GameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = gameData.find((g) => g.id === Number(id));

  if (!game) return <div className="game-detail">Oyun bulunamadı</div>;

  return (
    <div className="game-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>🔙 Geri Dön</button>
      <h2>{game.title}</h2>
      <p className="game-desc">{game.description}</p>
      <p className="game-howto">Nasıl oynanır: {game.howToPlay}</p>
      <iframe
        src={game.iframe}
        title={game.title}
        className="game-frame"
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default GameDetailPage;
