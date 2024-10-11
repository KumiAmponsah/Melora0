import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { supabase } from './supabaseClient';
import * as Device from 'expo-device';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { PieChart } from "react-native-chart-kit";

const StatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchStats = async () => {
      const deviceId = Device.deviceName + '-' + Device.osBuildId;
   
      const { data, error } = await supabase
        .from('library')
        .select('*')
        .eq('device_id', deviceId);

      if (error) {
        console.error(error);
      } else if (data.length > 0) {
        const searchesCount = data.length;
        const mostRecentSearch = data[0]; // Assuming the latest one comes first
        const mostSearchedSong = findMostSearchedSong(data);
        const genreData = calculateGenreDistribution(data);

        setStats({
          searchesCount,
          mostRecentSearch,
          mostSearchedSong,
          genreData,
        });
      } else {
        setStats({
          searchesCount: 0,
          mostRecentSearch: null,
          mostSearchedSong: "N/A",
          genreData: [],
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const findMostSearchedSong = (data) => {
    const countMap = {};
    data.forEach((song) => {
      const key = song.title;
      if (countMap[key]) {
        countMap[key] += 1;
      } else {
        countMap[key] = 1;
      }
    });

    let mostSearched = '';
    let maxCount = 0;
    Object.keys(countMap).forEach((song) => {
      if (countMap[song] > maxCount) {
        mostSearched = song;
        maxCount = countMap[song];
      }
    });
    return mostSearched;
  };

  const calculateGenreDistribution = (data) => {
    const genreMap = {};
    data.forEach((song) => {
      const genre = song.genre || "Unknown";
      if (genreMap[genre]) {
        genreMap[genre] += 1;
      } else {
        genreMap[genre] = 1;
      }
    });

    return Object.keys(genreMap).map((genre, index) => ({
      name: genre,
      population: genreMap[genre],
      color: getRandomColor(),
      legendFontColor: "#FFF",
      legendFontSize: 12,
    }));
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#00ff00" />;
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#121212', '#5e16ec']} style={styles.background}>
        <Text style={styles.title}>Your Music Stats</Text>

        <Animated.View entering={FadeInUp} style={styles.statBox}>
          <Icon name="music" size={40} color="white" />
          <Text style={styles.statText}>Most Searched Song: {stats.mostSearchedSong || "N/A"}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown} style={styles.statBox}>
          <Icon name="search" size={40} color="white" />
          <Text style={styles.statText}>Number of Searches: {stats.searchesCount}</Text>
        </Animated.View>

        {stats.mostRecentSearch && (
          <Animated.View entering={FadeInUp} style={styles.statBox}>
            <Icon name="clock-o" size={40} color="white" />
            <Text style={styles.statText}>
              Last Searched: {new Date(stats.mostRecentSearch.created_at).toLocaleDateString()}
            </Text>
          </Animated.View>
        )}

        {stats.mostRecentSearch && (
          <Animated.View entering={FadeInDown} style={styles.statBox}>
            <Image
              source={{ uri: stats.mostRecentSearch.album_art_url }}
              style={styles.albumArt}
            />
            <Text style={styles.statText}>
              Recently Searched: {stats.mostRecentSearch.title} by {stats.mostRecentSearch.artiste}
            </Text>
          </Animated.View>
        )}

        {/* Pie Chart for Genre Distribution */}
        <Text style={styles.chartTitle}>Most Searched Genres</Text>
        <Animated.View entering={FadeIn}>
          <PieChart
            data={stats.genreData}
            width={screenWidth - 20}
            height={220}
            chartConfig={{
              backgroundColor: '#1cc910',
              backgroundGradientFrom: '#34e89e',
              backgroundGradientTo: '#0f3443',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  statBox: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
   
  },
  statText: {
    color: "white",
    fontSize: 14,
    marginLeft: 10,
    padding:5,
    
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  chartTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
});

export default StatsScreen;
