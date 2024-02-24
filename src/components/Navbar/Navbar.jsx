import React, {useContext, useEffect, useState} from 'react';
import {AppBar, Avatar, Button, Drawer, IconButton, Toolbar, useMediaQuery} from '@mui/material';
import {AccountCircle, Brightness4, Brightness7, Menu} from '@mui/icons-material';
import {Link} from 'react-router-dom';
import {useTheme} from '@mui/material/styles';
import {useDispatch, useSelector} from 'react-redux';

import useStyles from './styles';
import {Search, Sidebar} from '..';
import {createSessionId, fetchToken, moviesApi} from '../../utils';
import {setUser, userSelector} from '../../features/auth';
import {ColorModeContext} from '../../utils/ToggleColorMode';

const Navbar = () => {
    const classes = useStyles();
    const isMobile = useMediaQuery('(max-width:600px)');
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const dispatch = useDispatch();
    const {isAuthenticated, user} = useSelector(userSelector);

    const colorMode = useContext(ColorModeContext);

    const token = localStorage.getItem('request_token');
    const sessionIdFromLocalStorage = localStorage.getItem('session_id');
    useEffect(() => {
        const logInUser = async () => {
            if (token) {
                if (sessionIdFromLocalStorage) {
                    const {data: userData} = await moviesApi.get(`/account?session_id=${sessionIdFromLocalStorage}`);
                    dispatch(setUser(userData));
                } else {
                    const sessionId = await createSessionId();
                    const {data: userData} = await moviesApi.get(`/account?session_id=${sessionId}`);
                    dispatch(setUser(userData));
                }
            }
        };
        logInUser();
    }, [token]);

    return (
        <div>
            <AppBar position="fixed">
                <Toolbar
                    className={classes.toolbar}
                    style={{backgroundColor: `${theme.palette.mode === 'dark' ? '#262626' : '#5d8ef5'}`}}
                >
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            style={{outline: 'none'}}
                            onClick={() => setMobileOpen((prevMobileOpen) => !prevMobileOpen)}
                            className={classes.menuButton}
                        >
                            <Menu/>
                        </IconButton>
                    )}
                    <IconButton color="inherit" sx={{ml: 1}} onClick={colorMode.toggleColorMode}>
                        {theme.palette.mode === 'dark' ? <Brightness4/> : <Brightness7/>}
                    </IconButton>
                    {!isMobile && <Search/>}
                    <div>
                        {!isAuthenticated ? (
                            <Button color="inherit" onClick={fetchToken}>
                                Login &nbsp; <AccountCircle/>
                            </Button>
                        ) : (
                            <Button
                                color="inherit"
                                component={Link}
                                to={`/profile/${user.id}`}
                                className={classes.linkButton}
                                onClick={() => {
                                }}
                            >
                                {!isMobile && <>My Movies &nbsp;</>}
                                <Avatar
                                    style={{width: 30, height: 30}}
                                    alt={user.username}
                                    src={`https://www.themoviedb.org/t/p/w64_and_h64_face${user?.avatar?.tmdb?.avatar_path}`}
                                />
                            </Button>
                        )}
                    </div>
                    {isMobile && <Search/>}
                </Toolbar>
            </AppBar>
            <div>
                <nav className={classes.drawer}>
                    {isMobile ? (
                        <Drawer
                            variant="temporary"
                            anchor="right"
                            open={mobileOpen}
                            onClose={() => setMobileOpen((prevMobileOpen) => !prevMobileOpen)}
                            classes={{paper: classes.drawerPaper}}
                            ModalProps={{keepMounted: true}}
                        >
                            <Sidebar setMobileOpen={setMobileOpen}/>
                        </Drawer>
                    ) : (
                        <Drawer variant="permanent" open classes={{paper: classes.drawerPaper}}>
                            <Sidebar setMobileOpen={setMobileOpen}/>
                        </Drawer>
                    )}
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
