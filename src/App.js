import './App.css';
import UploadFile from './components/UploadFile';
import 'react-toastify/dist/ReactToastify.css';  

function App() {
  return (
    <div className="App">
      <div className="app__logo">
        <img src="https://res.cloudinary.com/nghiango/image/upload/v1606835576/luudecor/luudecor_b6t1xd.png" alt="" width="70%"/>
      </div>
      
      <UploadFile />
    </div>
  );
}

export default App;
