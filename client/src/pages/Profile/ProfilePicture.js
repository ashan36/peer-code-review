import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogTitle,
  Typography,
  Paper,
  Button,
  CircularProgress,
  makeStyles
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import { useDropzone } from "react-dropzone";
import { CustomAvatar } from "components";

const useStyles = makeStyles({
  dropRoot: { padding: "3vh 2vh 1vh 2vh" },
  dropzone: {
    padding: "4vh 2vh",
    border: "2px dashed #6E3ADB"
  },
  dropzoneDisabled: {
    color: "#888888",
    padding: "4vh 2vh"
  },
  avatarRoot: {
    position: "relative",
    top: "7vh",
    display: "flex",
    flexDirection: "column"
  },
  avatarWrapper: {
    margin: "auto",
    height: "10vh",
    width: "10vh",
    minHeight: "66px",
    minWidth: "66px",
    borderRadius: "50%",
    display: "flex",
    alignContent: "center",
    justifyContent: "center"
  },
  avatar: {
    margin: "auto",
    height: "9vh",
    width: "9vh",
    minHeight: "60px",
    minWidth: "60px"
  },
  editButton: {
    width: "2vh",
    margin: "auto",
    position: "relative",
    left: "4vh"
  },
  invisibleEditButton: {
    width: "2vh",
    margin: "auto",
    position: "relative",
    left: "4vh",
    visibility: "hidden"
  },
  icon: {
    color: "#888888",
    "&:hover": {
      color: "black"
    }
  },
  previewWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "5px",
    height: "200px",
    marginTop: "2vh"
  },
  preview: {
    height: "200px",
    width: "200px",
    display: "flex",
    overflow: "hidden",
    borderRadius: "50%"
  },
  thumb: {
    objectFit: "cover",
    height: "auto",
    width: "100%",
    height: "100%"
  },
  uploadButton: {
    display: "flex",
    justifyContent: "flex-end"
  }
});

const maxFileSize = 2000000; //2mb

const Dropzone = ({ files, setFiles, saveAvatar }) => {
  const [accepted, setAccepted] = useState([...files]); //restore file if dialog is closed
  const [uploading, setUploading] = useState(false);
  const classes = useStyles();

  //Disable the dropzone if there is already a file waiting to be uploaded
  const disabled = () => {
    if (files.length < 1) {
      return false;
    } else return true;
  };

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onabort = () => window.alert("File reading was aborted");
      reader.onerror = () => window.alert("Error occured while reading file");
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const fileObj = new File([arrayBuffer], file.name);
        setFiles(prev => {
          prev.push({
            data: fileObj,
            type: file.type,
            preview: URL.createObjectURL(file)
          });
          return prev;
        });
        setAccepted([{ preview: URL.createObjectURL(file) }]);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const onDropRejected = useCallback((file, event) => {
    window.alert("File is not an accepted image.");
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDropRejected,
    onDrop,
    accept: "image/*",
    maxSize: maxFileSize,
    multiple: false,
    disabled: disabled()
  });

  const removeFile = () => {
    setFiles([]);
    setAccepted([]);
  };

  const getDropzoneStyles = () => {
    if (disabled()) {
      return classes.dropzoneDisabled;
    } else return classes.dropzone;
  };

  const getDropzoneText = () => {
    if (disabled()) {
      return "Remove current file to upload another";
    } else return "Drag 'n Drop or click to upload a picture (2MB or smaller)";
  };

  const handlePictureUpload = () => {
    setUploading(true);
    saveAvatar();
  };

  return (
    <div className={classes.dropRoot}>
      <div className={getDropzoneStyles()} {...getRootProps()}>
        <input {...getInputProps()} />
        <Typography variant="body1">{getDropzoneText()}</Typography>
      </div>
      <div className={classes.previewWrapper}>
        {accepted.map(file => {
          return (
            <div key={file.preview}>
              <div className={classes.preview}>
                <img src={file.preview} className={classes.thumb} />
              </div>
              <CloseIcon className={classes.icon} onClick={removeFile} />
            </div>
          );
        })}
      </div>
      <div className={classes.uploadButton}>
        {uploading && (
          <CircularProgress
            color="secondary"
            className={classes.uploadProgress}
          />
        )}
        <Button onClick={handlePictureUpload}>Upload</Button>
      </div>
    </div>
  );
};

const ProfilePicture = ({ editable, user, saveAvatar }) => {
  const classes = useStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState([]);

  const handleEditClick = () => {
    setIsEditing(prev => !prev);
  };

  const handleSaveAvatar = async () => {
    await saveAvatar(files[0]);
    setIsEditing(prev => !prev);
    setFiles([]);
  };

  return (
    <div className={classes.avatarRoot}>
      <Paper className={classes.avatarWrapper}>
        <Dialog open={isEditing} onClose={handleEditClick}>
          <DialogTitle>Upload a picture</DialogTitle>
          <Dropzone
            files={files}
            setFiles={setFiles}
            saveAvatar={handleSaveAvatar}
          />
        </Dialog>
        <CustomAvatar user={user} avatarStyles={classes.avatar} />
      </Paper>
      {editable ? (
        <div className={classes.editButton}>
          <EditIcon className={classes.icon} onClick={handleEditClick} />
        </div>
      ) : (
        <div className={classes.invisibleEditButton}>
          <EditIcon className={classes.icon} />
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
