import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://lycvlvndenqotocowdhy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Y3Zsdm5kZW5xb3RvY293ZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMDQ5MDUsImV4cCI6MjA0Mzg4MDkwNX0.FOcZfCUDjYkUN0R7YwSyNx3HBe4B6s3Hn__Et92lCdU";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Data = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('user').select('*');

        if (error) {
          console.error("Error fetching users:", error);
          setLoading(false);
          return;
        }

        if (data.length === 0) {
          console.log("No users found");
        } else {
          console.log("Fetched users:", data); // Log the fetched users to verify
        }

        setUsers(data); // Set the retrieved users to the state
        setLoading(false); // Stop loading
      } catch (err) {
        console.error("Unexpected error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.userContainer}>
              <Text style={styles.userText}>Email: {item.email}</Text>
              <Text style={styles.userText}>First Name: {item.fname}</Text>
              <Text style={styles.userText}>Last Name: {item.lname}</Text>
              <Text style={styles.userText}>Other Names: {item.othernames}</Text>
              <Text style={styles.userText}>Birthdate: {item.birthdate}</Text>
              <Text style={styles.userText}>Created At: {item.created_at}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noDataText}>No users found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
  },
  noDataText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
});

export default Data;
