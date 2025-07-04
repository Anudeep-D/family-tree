import { useState, MouseEvent } from "react"; // Added MouseEvent
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Badge,
  Popover, // Added Popover
} from "@mui/material";
import {
  Add as AddIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import "./Navbar.scss";
import CreateTree from "../Trees/CreateTree";
import Account from "./Account";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import NotificationList from "@/components/NotificationList/NotificationList"; // Import NotificationList

export default function Navbar() {
  const [openTree, setOpenTree] = useState(false);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  const handleNotificationClick = (event: MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const openNotifications = Boolean(notificationAnchorEl);
  const notificationPopoverId = openNotifications ? 'notification-popover' : undefined;

  return (
    <>
      <AppBar position="static" className="navbar-mui">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            FamilyTree
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            onClick={() => setOpenTree(true)}
            color="inherit"
            startIcon={<AddIcon />}
          >
            New Tree
          </Button>
          <IconButton
            color="inherit"
            aria-label="notifications"
            aria-describedby={notificationPopoverId}
            onClick={handleNotificationClick}
          >
            <Badge color="secondary" badgeContent={unreadCount > 0 ? unreadCount : null} max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Account />
        </Toolbar>
      </AppBar>
      <CreateTree open={openTree} onClose={() => setOpenTree(false)} />
      <Popover
        id={notificationPopoverId}
        open={openNotifications}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <NotificationList onClose={handleNotificationClose} />
      </Popover>
    </>
  );
}
// This is a common pattern but requires @mui/system or @mui/styled-engine
// For simplicity, if these cause issues, I might remove them and use sx props.
// Let's assume they work for now.
// import { styled } from '@mui/material/styles'; // Moved to top
