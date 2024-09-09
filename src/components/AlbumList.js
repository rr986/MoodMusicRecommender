import styled from 'styled-components';

const AlbumContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const AlbumItem = styled.div`
  background-color: #f5f5f5;
  padding: 20px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const AlbumTitle = styled.p`
  font-weight: bold;
  margin: 0;
`;

const Button = styled.button`
  background-color: #1976d2;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border: 2px solid #115293;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #115293;
  }
`;

const LinkButton = styled.a`
  background-color: #1976d2;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border: 2px solid #115293;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    background-color: #115293;
  }
`;

function AlbumList({ albums, onSave }) {
  if (albums.length === 0) {
    return <p>No recommendations available for this mood.</p>;
  }

  return (
    <AlbumContainer>
      <h2>Recommended Albums</h2>
      {albums.map((album, index) => (
        <AlbumItem key={index}>
          <div>
            <AlbumTitle>{album.title}</AlbumTitle>
            <p>by {album.artist}</p>
          </div>
          <div>
            <Button onClick={() => onSave(album)}>Tag for Later</Button>
            <LinkButton href={album.mp3}>Listen</LinkButton>
          </div>
        </AlbumItem>
      ))}
    </AlbumContainer>
  );
}

export default AlbumList;
