import React, {useEffect} from 'react';
import {Box, CircularProgress, Divider, List, ListItem, ListItemIcon, ListItemText, ListSubheader} from '@mui/material';
import {Link} from 'react-router-dom';
import {useTheme} from '@mui/styles';
import {useDispatch, useSelector} from 'react-redux';
import logo from '../../../public/watchlist.png';

import useStyles from './styles';
import {useGetGenresQuery} from '../../services/TMDB';
import genreIcons from '../../assets/genres';
import {selectGenreOrCategory} from '../../features/currentGenreOrCategory';

const categories = [
    {label: 'Popular', value: 'popular'},
    {label: 'Top Rated', value: 'top_rated'},
    {label: 'Upcoming', value: 'upcoming'},
];

const Sidebar = ({setMobileOpen}) => {
    const classes = useStyles();
    const {data, error, isFetching} = useGetGenresQuery();
    const dispatch = useDispatch();
    const {genreIdOrCategoryName} = useSelector((state) => state.currentGenreOrCategory);

    if (error) return 'An error has occured.';

    useEffect(() => {
        setMobileOpen(false);
    }, [genreIdOrCategoryName]);

    return (
        <>
            <Link to="/" className={classes.imageLink}>
                <img
                    className={classes.image}
                    src={logo}
                    alt="Filmpire"
                />
            </Link>
            <Divider/>
            <List>
                <ListSubheader>Categories</ListSubheader>
                {categories.map(({label, value}) => (
                    <Link key={value} className={classes.links} to="/">
                        <ListItem onClick={() => dispatch(selectGenreOrCategory(value))} button>
                            <ListItemIcon>
                                <img src={genreIcons[label.toLowerCase()]} className={classes.genreImage} height={30}/>
                            </ListItemIcon>
                            <ListItemText primary={label}/>
                        </ListItem>
                    </Link>
                ))}
            </List>
            <Divider/>
            <List>
                <ListSubheader>Genres</ListSubheader>
                {isFetching ? (
                    <Box display="flex" justifyContent="center">
                        <CircularProgress/>
                    </Box>
                ) : data.genres.map(({name, id}) => (
                    <Link key={name} className={classes.links} to="/">
                        <ListItem onClick={() => dispatch(selectGenreOrCategory(id))} button>
                            <ListItemIcon>
                                <img src={genreIcons[name.toLowerCase()]} className={classes.genreImage} height={30}/>
                            </ListItemIcon>
                            <ListItemText primary={name}/>
                        </ListItem>
                    </Link>
                ))}
            </List>
        </>
    );
};

export default Sidebar;
