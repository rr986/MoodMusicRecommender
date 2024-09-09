import styled from 'styled-components';

const SavedAlbumsContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const AlbumItem = styled.div`
  background-color: #f5f5f5;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
`;

const AlbumTitle = styled.p`
  font-weight: bold;
  margin: 0;
`;

const DeleteButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #c0392b;
  }
`;

function SavedAlbums({ albums, handleDelete }) {
  if (albums.length === 0) {
    return <p>No albums saved for later.</p>;
  }

  return (
    <SavedAlbumsContainer>
      <h2>Albums Tagged for Later</h2>
      {albums.map((album, index) => (
        <AlbumItem key={index}>
          <AlbumTitle>{album.title}</AlbumTitle>
          <p>by {album.artist}</p>
          <DeleteButton onClick={() => handleDelete(album._id)}>Delete</DeleteButton>
        </AlbumItem>
      ))}
    </SavedAlbumsContainer>
  );
}

export default SavedAlbums;
