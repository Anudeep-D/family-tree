import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./PersonNode.scss";
import { NodeDataMap, Nodes } from "@/types/nodeTypes";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";
import { getImage } from "@/routes/common/imageStorage";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";

export type PersonNode = Node<NodeDataMap[Nodes.Person], Nodes.Person>;

const PersonNode = ({ data }: NodeProps<PersonNode>) => {
  const { user } = useAuth(); // Get user object from useAuth

  const [imageUrlToDisplay, setImageUrlToDisplay] = useState<
    string | undefined
  >(undefined);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);
  const popoverId = openPopover ? "simple-popover" : undefined;

  useEffect(() => {
    if (data.imageUrl) {
      const urlPromise = getImage(data.imageUrl);
      urlPromise
        .then((url) => setImageUrlToDisplay(url ?? undefined))
        .catch((e) => {
          console.error("Error creating URL for cache busting:", e);
          setImageUrlToDisplay(data.imageUrl);
        });
    } else {
      setImageUrlToDisplay(undefined);
    }
  }, [data.imageUrl]); // Re-run if imageUrl or user changes

  const hasExtraDetails =
    data.gender ||
    data.dob ||
    data.doe ||
    data.qualification ||
    data.job ||
    data.currLocation;

  const extraDetailsContent = (
    <>
      <Typography sx={{ p: 2, fontWeight: "bold" }}>{data.name}</Typography>
      {data.nickName && <Typography sx={{ p: 1, pt:0 }}>({data.nickName})</Typography>}
      {data.gender && <Typography sx={{ p: 1 }}>{data.gender}</Typography>}
      {data.dob && (
        <Typography
          sx={{ p: 1 }}
          className="green"
        >{`DOB: ${dayjs(data.dob).format("DD-MMM-YYYY")}`}</Typography>
      )}
      {data.doe && (
        <Typography
          sx={{ p: 1 }}
          className="red"
        >{`DOE: ${dayjs(data.doe).format("DD-MMM-YYYY")}`}</Typography>
      )}
      {data.qualification && (
        <Typography sx={{ p: 1 }}>{data.qualification}</Typography>
      )}
      {data.job && <Typography sx={{ p: 1 }}>{data.job}</Typography>}
      {data.currLocation && (
        <Typography sx={{ p: 1 }}>{data.currLocation}</Typography>
      )}
    </>
  );

  const mainContent = (
    <div className="node-content">
      <strong>{data.name}</strong>
      {data.nickName && <div className="nickname">({data.nickName})</div>}
    </div>
  );

  const personNodeClasses = `person-node person-node-hoverable ${
    data.isAlive ? "alive" : "deceased"
  } ${imageUrlToDisplay ? "has-image" : ""}`;

  return (
    <div
      className={personNodeClasses}
      style={
        imageUrlToDisplay
          ? { backgroundImage: `url(${imageUrlToDisplay})` }
          : {}
      }
    >
      {imageUrlToDisplay ? (
        <div className="node-content">
          <strong className="person-name-on-image">{data.name}</strong>
        </div>
      ) : (
        mainContent
      )}
      {hasExtraDetails && (
        <IconButton
          aria-describedby={popoverId}
          size="small"
          onClick={handlePopoverOpen}
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
            backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional: for better visibility
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)", // Optional: for better visibility
            },
          }}
        >
          <InfoIcon fontSize="small" /> {/* Adjusted icon size */}
        </IconButton>
      )}
      <Popover
        id={popoverId}
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {extraDetailsContent}
      </Popover>
      <Handle id="l1" type="target" position={Position.Left} />
      <Handle id="r1" type="source" position={Position.Right} />
      <Handle id="t1" type="target" position={Position.Top} />
      <Handle id="b1" type="source" position={Position.Bottom} />
    </div>
  );
};

export default PersonNode;
