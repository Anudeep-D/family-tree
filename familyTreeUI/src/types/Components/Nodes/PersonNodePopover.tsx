import { Popover, Typography, Box } from "@mui/material";
import { NodeDataMap, Nodes } from "@/types/nodeTypes";
import dayjs from "dayjs";

type PersonNodePopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  nodeData: NodeDataMap[Nodes.Person] | null;
};

export const PersonNodePopover = ({
  open,
  anchorEl,
  onClose,
  nodeData,
}: PersonNodePopoverProps) => {
  if (!nodeData) {
    return null;
  }

  return (
    <Popover
      id={open ? "person-details-popover" : undefined}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      PaperProps={{
        style: {
          backgroundColor: "rgba(50, 50, 50, 0.9)",
          borderRadius: "8px",
          backdropFilter: "blur(5px)",
        },
      }}
    >
      <Box sx={{ p: 0.5 }}>
        <Typography
          sx={{
            py: 1,
            px: 1.5,
            fontWeight: "bold",
            fontSize: "0.7rem",
            color: "#fff",
          }}
        >
          {nodeData.name}
        </Typography>

        {nodeData.nickName && (
          <Typography
            sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#ccc" }}
          >
            ({nodeData.nickName})
          </Typography>
        )}

        {nodeData.gender && (
          <Typography
            sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#80d8ff" }}
          >
            {nodeData.gender}
          </Typography>
        )}

        {(nodeData.dob || nodeData.doe) && (
          <Typography
            sx={{
              pb: 0.6,
              px: 1.5,
              fontSize: "0.6rem",
              color: nodeData.doe
                ? "#ef9a9a"
                : nodeData.dob
                ? "#a5d6a7"
                : "#ffecb3",
            }}
          >
            {`Lifespan: ${
              nodeData.dob ? dayjs(nodeData.dob).format("DD-MMM-YYYY") : "?"
            } - ${
              nodeData.doe ? dayjs(nodeData.doe).format("DD-MMM-YYYY") : ""
            } ${
              nodeData.dob
                ? `(${dayjs(nodeData.doe || new Date()).diff(
                    dayjs(nodeData.dob),
                    "year"
                  )} yrs)`
                : ""
            }`}
          </Typography>
        )}

        {nodeData.education && (
          <>
            {nodeData.education.highestQualification && (
              <Typography
                sx={{
                  pb: 0.6,
                  px: 1.5,
                  fontSize: "0.6rem",
                  color: "#e1bee7",
                }}
              >
                Education: {nodeData.education.highestQualification}
                {nodeData.education.fieldOfStudy &&
                  ` in ${nodeData.education.fieldOfStudy}`}
              </Typography>
            )}
            {nodeData.education.institution && (
              <Typography
                sx={{
                  pb: 0.6,
                  px: 1.5,
                  fontSize: "0.6rem",
                  color: "#e1bee7",
                }}
              >
                Institution: {nodeData.education.institution}
                {nodeData.education.location &&
                  `, ${nodeData.education.location}`}
              </Typography>
            )}
          </>
        )}

        {nodeData.job?.jobTitle && (
          <Typography
            sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#ffcc80" }}
          >
            Job: {nodeData.job.jobTitle}
            {nodeData.job.employer && ` at ${nodeData.job.employer}`}
            {nodeData.job.jobType && ` (${nodeData.job.jobType})`}
          </Typography>
        )}

        {nodeData.currLocation && (
          <Typography
            sx={{ pb: 0.6, px: 1.5, fontSize: "0.6rem", color: "#80cbc4" }}
          >
            {nodeData.currLocation}
          </Typography>
        )}
      </Box>
    </Popover>
  );
};
