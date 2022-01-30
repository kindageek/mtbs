import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Stack, Heading } from "native-base";
import { Alert, ScrollView, Image } from "react-native";

import { View } from "../Themed";
import { Movie } from "../../types/types";
import { GET_ALL_MOVIES_MUTATION } from "../../utils/gql";

import Loader from "../loader/loader.component";
import MoviesListItem from "../movies-list-item/movies-list-item.component";

import { styles } from "./movies-list.styles";

const MoviesList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const { loading, error, data } = useQuery(GET_ALL_MOVIES_MUTATION);

  useEffect(() => {
    if (!error) return;
    console.log(JSON.stringify(error, null, 2));
    Alert.alert(error.graphQLErrors[0].message);
  }, [error]);

  useEffect(() => {
    if (!data) return;
    data?.getAllMovies?.map(async (movie: Movie) => {
      await Image.prefetch(movie.imgUrl);
    });
    setMovies(data?.getAllMovies);
  }, [data]);

  return !movies.length || loading ? (
    <Loader />
  ) : (
    <ScrollView style={styles.container}>
      <View style={styles.moviesList}>
        <Heading size='xl' color={"secondary.500"} mb={4}>
          Today on screen
        </Heading>
        <ScrollView horizontal>
          <Stack space={4} direction={"row"}>
            {movies.map((movie, index) => (
              <MoviesListItem movie={movie} key={index} />
            ))}
          </Stack>
        </ScrollView>
      </View>
      <View style={styles.moviesList}>
        <Heading size='xl' color={"secondary.500"} mb={4}>
          Coming soon
        </Heading>
        <ScrollView horizontal>
          <Stack space={4} direction={"row"}>
            {movies.map((movie, index) => (
              <MoviesListItem movie={movie} key={index} />
            ))}
          </Stack>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default MoviesList;
