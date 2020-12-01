import React from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import XLSX from "xlsx";
import axios from "axios";

//axios.defaults.baseURL = 'http://localhost:1337';

const getColor = (props) => {
  if (props.isDragAccept) {
    return "#00e676";
  }
  if (props.isDragReject) {
    return "#ff1744";
  }
  if (props.isDragActive) {
    return "#2196f3";
  }
  return "#eeeeee";
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props) => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
`;

async function getSlice(data) {
  let promises = [];
  data.forEach((hangMuc) => {
    console.log(hangMuc);
    promises.push(
      axios.post('http://localhost:1337/v1/hangmuc/update',hangMuc)
        //.then((res) => res.json())
        .then((result) => console.log(result.data.message))
        .catch((err) => {
          return null;
        })
    );
  });
  console.log(promises)
  await Promise.all(promises);
}

const Heading = [
  "STT",
  "name",
  "description",
  //"stringSize",
  "sizeL",
  "sizeW",
  "sizeH",
  "unit",

  "mfcMelamine",
  "thungMfcCanhMdfSon",
  "thungMfcCanhAcrylic",
  "mdfSon2K",
  "mdfMelamine",
  "canhSonChayPano",
  "thungMdfCanhAcrylic",
  "thungMdfCanhGoSoi",
  "thungMdfCanhVeneerSoi",
  "hdfSon2K",
  "hdfMelamine",
  "nhuaPvc",
  "quan",
  "catagoryKey"
  
];

const getCategory = (input) => {

  switch(input) {
    case "PHÒNG BẾP": {
      return "phong_bep";
    }
    case "PHÒNG KHÁCH": {
      return "phong_khach";
    }
    case "PHÒNG NGỦ": {
      return "phong_ngu";
    }
    case "WC": {
      return "phong_ve_sinh";
    }
    default:
      return "other"
    
  }
}

/**
 * Ham parse file xlsx
 * @param {*} acceptedFiles
 */
const handleExcelDrop = (acceptedFiles) => {
  console.log("handleExcelDrop");
  //setFileNames(acceptedFiles.map(file => file.name));
  acceptedFiles.forEach((file) => {
    console.log("handleExcelDrop:forEach(file)");
    // See https://stackoverflow.com/questions/30859901/parse-xlsx-with-node-and-create-json
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString; // !! converts object to boolean
    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = (e) => {
      // Do what you want with the file contents
      var bstr = e.target.result;
      var workbook = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
      var sheet_name_list = workbook.SheetNames[0];

      const workSheet = workbook.Sheets[sheet_name_list];

      var jsonFromExcel = XLSX.utils.sheet_to_json(workSheet, {
        header: Heading,
        skipHeader: true,
        range: 2,
        
      });

      let cates = "";
      let datas = [];
      jsonFromExcel.forEach((record) => {
        if (record["STT"] === undefined) {
          cates = record["name"];
        } else {
          record["sizeL"] = `${record["sizeL"]}`;
          record["sizeW"] = `${record["sizeW"]}`;
          record["sizeH"] = `${record["sizeH"]}`; 
          record["categoryKey"] = getCategory(cates);
          datas.push(record);
        }
      });

      //console.log(datas);
      getSlice(datas)
        .then(() => console.log("all data processed"))
        .catch((err) => console.error(err));
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  });
};

const UploadFile = () => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      handleExcelDrop(acceptedFiles);
    },
    accept: ".xlsx",
  });

  const _files = acceptedFiles.map((file) => {
    return (
      <li key={file.path}>
        {file.path} - {file.size} bytes
      </li>
    );
  });

  return (
    <div className="container">
      <Container
        {...getRootProps({ isDragActive, isDragAccept, isDragReject })}
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </Container>
      <aside>
        <h4>Files</h4>
        <ul>{_files}</ul>
      </aside>
    </div>
  );
};

export default UploadFile;
