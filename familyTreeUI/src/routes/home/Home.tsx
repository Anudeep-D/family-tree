import { useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Breadcrumbs,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux"; // Added
import { AppDispatch, RootState } from "@/app/store"; // Added
import { fetchNotifications } from "@/redux/notificationSlice"; // Added
import Navbar from "./NavBar/Navbar";
import Tree from "./Tree/Tree"; // This is the component that displays a single tree's graph
import Trees from "./Trees/Trees"; // This is the component that lists all trees (previously Trees)
import { Tree as TreeType } from "@/types/entityTypes"; // Renamed Tree to TreeType to avoid conflict with component
import "./Home.scss";

import { getErrorMessage } from "@/utils/common";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTreeQuery } from "@/redux/queries/tree-endpoints";
export default function Home() {
  const dispatch: AppDispatch = useDispatch(); // Added
  const notificationStatus = useSelector((state: RootState) => state.notifications.status); // Added

  const { treeId: encodedId } = useParams<{ treeId: string }>(); // Changed
  const treeId = encodedId && decodeURIComponent(encodedId!); // Changed
  const navigate = useNavigate();
  const {
    data: tree, // Changed
    isFetching: isTreeFetching, // Changed
    isLoading: isTreeLoading, // Changed
    isError: isTreeError, // Changed
    error: TreeError, // Changed
  } = useGetTreeQuery({ treeId: treeId! }, { skip: !treeId }); // Changed
  const [treesKey, setTreesKey] = useState(0);
  // useEffect to fetch notifications
  useEffect(() => {
    if (notificationStatus === 'idle') {
      dispatch(fetchNotifications());
    }
  }, [notificationStatus]);

  useEffect(() => {
    if (treeId && (isTreeFetching || isTreeLoading)) // Changed
      setisLoading(true);
    else setisLoading(false);
  }, [
    treeId, // Changed
    tree, // Changed
    isTreeFetching, // Changed
    isTreeLoading, // Changed
    isTreeError, // Changed
    TreeError, // Changed
  ]);

  const [isLoading, setisLoading] = useState<boolean>(false);

  const handleTreeSelection = (selectedTree: TreeType) => { // Changed parameter name and type
    navigate(`/trees/${encodeURIComponent(selectedTree.elementId!)}`); // Changed
  };
  return (
    <Box>
      <Navbar />
      <Box className="breadcrumbs-container">
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            className="breadcrumb-link"
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => {setTreesKey(prev => prev + 1);navigate(`/`)}}
          >
            <HomeIcon
              fontSize="small"
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />
            Home
          </Link>
          {tree && ( // Changed
            <Typography className="breadcrumb-current">
              {tree.name} 
            </Typography>
          )}
        </Breadcrumbs>
      </Box>
      {isLoading && (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      )}
      {treeId && isTreeError && ( // Changed
        <Alert severity="error">
          <AlertTitle>Failed to fetch tree data</AlertTitle> 
          {getErrorMessage(TreeError)} 
        </Alert>
      )}
      {treeId && tree && <Tree tree={tree} />} 

      {!treeId && ( 
        <Trees key={treesKey} handleTreeSelection={handleTreeSelection} /> 
      )}
    </Box>
  );
}
