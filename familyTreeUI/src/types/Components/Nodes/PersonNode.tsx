import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./PersonNode.scss";
import { NodeDataMap, Nodes } from "@/types/nodeTypes";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { getImage } from "@/routes/common/imageStorage";
import IconButton from "@mui/material/IconButton";
import { InfoTwoTone } from "@mui/icons-material";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { Box, Button } from "@mui/material";

export type PersonNode = Node<NodeDataMap[Nodes.Person], Nodes.Person>;

const PersonNode = ({ data }: NodeProps<PersonNode>) => {
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

  const hasExtraDetails =
    data.gender ||
    data.dob ||
    data.doe ||
    (data.education &&
      (data.education.fieldOfStudy ||
        data.education.highestQualification ||
        data.education.institution ||
        data.education.location)) ||
    (data.job &&
      (data.job.jobType || data.job.employer || data.job.jobTitle)) ||
    data.currLocation;

  const mainContent = (
    <div className="node-content">
      <div style={{ display: "flex", alignItems: "center" }}>
        <strong>{data.name}</strong>
        {hasExtraDetails && (
          <IconButton
            aria-describedby={popoverId}
            size="small" // Keep small for now, can adjust if needed
            onClick={handlePopoverOpen}
            // Remove sx prop with absolute positioning and background
            style={{ marginLeft: "4px" }} // Add some space between name and icon
          >
            <InfoTwoTone fontSize="small" />
          </IconButton>
        )}
      </div>
      {data.nickName && <div className="nickname">({data.nickName})</div>}
    </div>
  );

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
  }, [data.imageUrl, data.updatedOn]); // Re-run if imageUrl or user changes

  const extraDetailsContent = (
    <Box>
      <Typography
        sx={{
          py: 1,
          px: 1.5,
          fontWeight: "bold",
          fontSize: "0.7rem",
          color: "#fff",
        }}
      >
        {data.name}
      </Typography>

      {data.nickName && (
        <Typography
          sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#ccc" }}
        >
          ({data.nickName})
        </Typography>
      )}

      {data.gender && (
        <Typography
          sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#80d8ff" }}
        >
          {data.gender}
        </Typography>
      )}

      {(data.dob || data.doe) && (
        <Typography
          sx={{
            pb: 0.6,
            px: 1.5,
            fontSize: "0.6rem",
            color: data.doe ? "#ef9a9a" : data.dob ? "#a5d6a7" : "#ffecb3", // red if deceased, green if alive, amber otherwise
          }}
        >
          {`Lifespan: ${
            data.dob ? dayjs(data.dob).format("DD-MMM-YYYY") : "?"
          } - ${data.doe ? dayjs(data.doe).format("DD-MMM-YYYY") : ""} ${
            data.dob
              ? `(${dayjs(data.doe || new Date()).diff(
                  dayjs(data.dob),
                  "year"
                )} yrs)`
              : ""
          }`}
        </Typography>
      )}

      {data.education && (
        <>
          {data.education.highestQualification && (
            <Typography
              sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#e1bee7" }}
            >
              Education: {data.education.highestQualification}
              {data.education.fieldOfStudy &&
                ` in ${data.education.fieldOfStudy}`}
            </Typography>
          )}
          {data.education.institution && (
            <Typography
              sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#e1bee7" }}
            >
              Institution: {data.education.institution}
              {data.education.location && `, ${data.education.location}`}
            </Typography>
          )}
        </>
      )}

      {data.job?.jobTitle && (
        <Typography
          sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#ffcc80" }}
        >
          Job: {data.job.jobTitle}
          {data.job.employer && ` at ${data.job.employer}`}
          {data.job.jobType && ` (${data.job.jobType})`}
        </Typography>
      )}

      {data.currLocation && (
        <Typography
          sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#80cbc4" }}
        >
          {data.currLocation}
        </Typography>
      )}
    </Box>
  );

  const personNodeClasses = `person-node person-node-hoverable ${
    data.isAlive==="Yes" ? "alive" : "deceased"
  } ${imageUrlToDisplay ? "has-image" : ""}`;

  const displayLabel = data.nickName
    ? data.nickName.length > 13
      ? `${data.nickName.slice(0, 10)}...`
      : data.nickName
    : data.name.length > 13
    ? `${data.name.slice(0, 10)}...`
    : data.name;
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
          {/* This div will act as the new 'person-name-on-image' styled container */}
          <div
            className="person-name-on-image"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              variant="text"
              className="person-name-on-image"
              size="small"
              disableRipple
              disableElevation
              sx={{
                backgroundColor: "transparent",
                padding: 0,
                fontWeight: "bold",
                fontSize: "14px",
                textTransform: "none",
                fontFamily: "Impact, Charcoal, sans-serif",
                WebkitTextStroke: "0.5px #ffffff", // yellow stroke
                color: "#111111", // inner fill
              }}
              onClick={handlePopoverOpen}
              endIcon={
                <InfoTwoTone fontSize="small" sx={{ fill: "#ffffff" }} />
              }
            >
              {displayLabel}
            </Button>
          </div>
        </div>
      ) : (
        mainContent
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
