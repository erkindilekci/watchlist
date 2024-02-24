import React, {useEffect, useState} from 'react';
import {Box, Button, ButtonGroup, CircularProgress, Grid, Modal, Rating, Typography} from '@mui/material';
import {
    ArrowBack,
    Favorite,
    FavoriteBorderOutlined,
    Language,
    Movie as MovieIcon,
    PlusOne,
    Remove,
    Theaters
} from '@mui/icons-material';
import {Link, useParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';

import {useGetListQuery, useGetMovieQuery, useGetRecommendationsQuery} from '../../services/TMDB';
import useStyles from './styles';
import genreIcons from '../../assets/genres';
import {selectGenreOrCategory} from '../../features/currentGenreOrCategory';
import {MovieList} from '..';
import {userSelector} from '../../features/auth';

const MovieInformation = () => {
    const classes = useStyles();
    const {id} = useParams();
    const {user} = useSelector(userSelector);
    const {data, isFetching, error} = useGetMovieQuery(id);
    const {
        data: recommendations,
        isFetching: isRecommendationsFetching
    } = useGetRecommendationsQuery({list: '/recommendations', movie_id: id});
    const {data: favoriteMovies} = useGetListQuery({
        listName: 'favorite/movies',
        accountId: user.id,
        sessionId: localStorage.getItem('session_id'),
        page: 1
    });
    const {data: watchlistMovies} = useGetListQuery({
        listName: 'watchlist/movies',
        accountId: user.id,
        sessionId: localStorage.getItem('session_id'),
        page: 1
    });
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    const [isMovieFavorite, setIsMovieFavorite] = useState(false);
    const [isMovieInWatchlist, setIsMovieInWatchlist] = useState(false);

    useEffect(() => {
        setIsMovieFavorite(!!favoriteMovies?.results?.find((movie) => movie?.id === data?.id));
    }, [favoriteMovies, data]);

    useEffect(() => {
        setIsMovieInWatchlist(!!watchlistMovies?.results?.find((movie) => movie?.id === data?.id));
    }, [watchlistMovies, data]);

    const addToFavorites = async () => {
        await axios.post(`https://api.themoviedb.org/3/account/${user.id}/favorite?api_key=${import.meta.env.TMDB_KEY}&session_id=${localStorage.getItem('session_id')}`, {
            media_type: 'movie',
            media_id: id,
            favorite: !isMovieFavorite,
        });
        setIsMovieFavorite((prev) => !prev);
    };

    const addToWatchlist = async () => {
        await axios.post(`https://api.themoviedb.org/3/account/${user.id}/watchlist?api_key=${import.meta.env.TMDB_KEY}&session_id=${localStorage.getItem('session_id')}`, {
            media_type: 'movie',
            media_id: id,
            watchlist: !isMovieInWatchlist,
        });
        setIsMovieInWatchlist((prev) => !prev);
    };

    if (isFetching || isRecommendationsFetching) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress size="8rem"/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center">
                <Link to="/">Something went wrong! - Go back to Home</Link>
            </Box>
        );
    }

    return (
        <Grid container className={classes.containerSpaceAround}>
            <Grid item sm={12} lg={4} style={{display: 'flex', marginBottom: '30px'}}>
                <img
                    className={classes.poster}
                    src={`https://image.tmdb.org/t/p/w500/${data?.poster_path}`}
                    alt={data?.title}
                />
            </Grid>
            <Grid item container direction="column" lg={7}>
                <Typography variant="h3" align="center"
                            gutterBottom>{data?.title} ({data.release_date.split('-')[0]})</Typography>
                <Typography variant="h5" align="center" gutterBottom>{data?.tagline}</Typography>
                <Grid container className={classes.containerSpaceAround}>
                    <Box display="flex" align="center">
                        <Rating readOnly value={data.vote_average / 2}></Rating>
                        <Typography variant="subtitle1" gutterBottom
                                    style={{marginLeft: '10px'}}>{data?.vote_average}/10 </Typography>
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>{data?.runtime} min |
                        Language: {data?.spoken_languages[0].name}</Typography>
                </Grid>
                <Grid item className={classes.genreContainer}>
                    {data?.genres?.map((genre, i) => (
                        <Link key={genre.name} className={classes.links} to="/"
                              onClick={() => dispatch(selectGenreOrCategory(genre.id))}>
                            <img src={genreIcons[genre.name.toLowerCase()]} className={classes.genreImage} height={30}/>
                            <Typography color="textPrimary" variant="subtitle1">{genre?.name}</Typography>
                        </Link>
                    ))}
                </Grid>
                <Typography variant="h5" gutterBottom style={{marginTop: '10px'}}>Overview</Typography>
                <Typography style={{marginBottom: '2rem'}}>{data?.overview}</Typography>
                <Typography variant="h5" gutterBottom>Top Cast</Typography>
                <Grid item container spacing={2}>
                    {data && data.credits.cast.map((character, i) => (
                        character.profile_path && (
                            <Grid key={i} item xs={4} md={2} component={Link} to={`/actor/${character.id}`}
                                  style={{textDecoration: 'none'}}>
                                <img className={classes.castImage}
                                     src={`https://image.tmdb.org/t/p/w500/${character.profile_path}`}
                                     alt={character.name}/>
                                <Typography color="textPrimary">{character.name}</Typography>
                                <Typography color="textSecondary">{character.character.split('/')[0]}</Typography>
                            </Grid>
                        )
                    )).slice(0, 6)}
                </Grid>
                <Grid item container style={{marginTop: '2rem'}}>
                    <div className={classes.buttonsContainer}>
                        <Grid item xs={12} sm={6} className={classes.buttonsContainer}>
                            <ButtonGroup size="medium" variant="outlined">
                                <Button target="_blank" rel="noopener noreferrer" href={data?.homepage}
                                        endIcon={<Language/>}>Website</Button>
                                <Button target="_blank" rel="noopener noreferrer"
                                        href={`https://www.imdb.com/title/${data.imdb_id}`}
                                        endIcon={<MovieIcon/>}>IMDB</Button>
                                <Button onClick={() => setOpen(true)} href="#" endIcon={<Theaters/>}>Trailer</Button>
                            </ButtonGroup>
                        </Grid>
                        <Grid item xs={12} sm={6} className={classes.buttonsContainer}>
                            <ButtonGroup size="medium" variant="outlined">
                                <Button onClick={addToFavorites} endIcon={isMovieFavorite ? <FavoriteBorderOutlined/> :
                                    <Favorite/>}>{isMovieFavorite ? 'Unfavorite' : 'Favorite'}</Button>
                                <Button onClick={addToWatchlist} endIcon={isMovieInWatchlist ? <Remove/> :
                                    <PlusOne/>}>{isMovieInWatchlist ? 'Remove' : 'Watchlist'}</Button>
                                <Button endIcon={<ArrowBack/>} sx={{borderColor: 'primary.main'}}>
                                    <Typography component={Link} to="/" color="inherit" variant="subtitle2"
                                                style={{textDecoration: 'none'}}>Back</Typography>
                                </Button>
                            </ButtonGroup>
                        </Grid>
                    </div>
                </Grid>
            </Grid>
            <Box marginTop="5rem" width="100%">
                <Typography variant="h3" align="center" gutterBottom>You might also like</Typography>
                {recommendations
                    ? <MovieList movies={recommendations} numberOfMovies={12}/>
                    : <Box>Sorry, nothing is found.</Box>
                }
            </Box>
            <Modal
                closeAfterTransition
                className={classes.modal}
                open={open}
                onClose={() => setOpen(false)}
            >
                {data?.videos?.results?.length > 0 && (
                    <iframe
                        autoPlay
                        className={classes.video}
                        frameBorder="0"
                        title="Trailer"
                        src={`https://www.youtube.com/embed/${data.videos.results[0].key}`}
                        allow="autoplay"
                    />
                )}
            </Modal>
        </Grid>
    );
};

export default MovieInformation;
