import React, { useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import XLSX from "xlsx";
import axios from "axios";
import Button from "../Button";
import { toast } from "react-toastify";
import CircularLoader from "../Container";

// Cấu hình thông báo toast
toast.configure();

const baseStyle = {
  flex: 1,
  margin: "50px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#9d9d9d",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#9d9d9d",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
  color: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
  color: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
  color: "#ff1744",
};


async function getSlice(data) {
  let promises = [];
  data.forEach((hangMuc) => {
    //console.log(hangMuc);
    promises.push(
      axios
        .post("https://luudecor.herokuapp.com/v1/hangmuc/update", hangMuc)
        //.then((res) => res.json())
        .then((result) => {
          //console.log(result.data);
          if (result.data.statusCode === "10000") {
            toast.success(result.data.message, { autoClose: false });
          } else {
            toast.error(result.data.message, { autoClose: false });
          }
        })
        .catch((err) => {
          return null;
        })
    );
  });
  //console.log(promises);
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
  "catagoryKey",
];

const getCategory = (input) => {
  switch (input) {
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
      return "other";
  }
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

  //
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  //

  const _files = acceptedFiles.map((file) => {
    return (
      <li key={file.path}>
        {file.path} - {file.size} bytes
      </li>
    );
  });

  /**
   * Ham parse file xlsx
   * @param {*} acceptedFiles
   */
  const handleExcelDrop = (acceptedFiles) => {
    //console.log("handleExcelDrop");
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
        setData(datas);
      };
      if (rABS) reader.readAsBinaryString(file);
      else reader.readAsArrayBuffer(file);
    });
  };

  const onClickHandler = () => {
    //console.log(datas);
    if (data.length <= 0) {
      alert("Vui lòng upload File DATA đúng định dạng.");
      return;
    }

    setLoading(true);
    getSlice(data)
      .then(() => {
        console.log("all data processed");
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  return (
    <div className="container">
      {loading ? (
        <CircularLoader size={64} />
      ) : (
        <>
          <div className="app__logo">
            <img
              src="https://res.cloudinary.com/nghiango/image/upload/v1606835576/luudecor/luudecor_b6t1xd.png"
              alt=""
              width="70%"
            />
          </div>
          <div
            {...getRootProps({
              style
            })}
          >
            <input {...getInputProps()} />
            <p>Kéo thả File vào đây</p>
            <p>Hoặc Click vào đây để chọn File</p>
          </div>
          <aside>
            <h4>Files</h4>
            <ul>{_files}</ul>
          </aside>
          <Button primary onClick={onClickHandler}>
            Upload Data
          </Button>
        </>
      )}
    </div>
  );
};

export default UploadFile;
