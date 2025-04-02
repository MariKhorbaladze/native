import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import { useAuth } from '../utils/authContext';
import { fetchProducts, fetchCategories, fetchProductsByCategory, adaptProductData } from '../utils/api';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [banners, setBanners] = useState([
    { id: 1, image: 'https://picsum.photos/800/300?random=1' },
    { id: 2, image: 'https://picsum.photos/800/300?random=2' },
    { id: 3, image: 'https://picsum.photos/800/300?random=3' },
  ]);

  const loadProducts = async (categoryId = null) => {
    setError(null);
    setIsLoading(true);
    try {
      let data;
      if (categoryId) {
        data = await fetchProductsByCategory(categoryId);
      } else {
        data = await fetchProducts();
      }
      setProducts(adaptProductData(data));
    } catch (error) {
      // console.error('Error loading products:', error);
      setError('პროდუქციის ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      // console.error('Error loading categories:', error);
      setCategories([
        { id: 1, name: 'ელექტრონიკა' },
        { id: 2, name: 'ტანსაცმელი' },
        { id: 3, name: 'აქსესუარები' },
      ]);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadProducts(selectedCategory), loadCategories()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    loadProducts(categoryId);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  const renderBanner = ({ item }) => (
    <Image
      source={{ uri: item.image }}
      style={styles.bannerImage}
      resizeMode="cover"
    />
  );

  return (
    <View style={styles.container}>
      <Header title={`გამარჯობა, ${user?.name || 'მომხმარებელი'}`} showLogout />
      <FlatList
  data={products}
  renderItem={({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', item)}
    />
  )}
  keyExtractor={(item, index) => `product-${item.id || index}`}
  numColumns={2}
  contentContainerStyle={styles.productList}
  ListHeaderComponent={
    <>
        <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>კატეგორიები</Text>

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item, index) => item.id ? `category-${item.id}` : `category-all-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.productsSection}>
        <View style={styles.productsHeader}>
          <Text style={styles.sectionTitle}>პოპულარული პროდუქტები</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>ყველას ნახვა</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.productsHeader}>
        <Text style={styles.sectionTitle}>პროდუქცია</Text>
      </View>
    </>
  }
  ListEmptyComponent={
    !isLoading && (
      <View style={styles.emptyContainer}>
        <Ionicons name="basket-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>
          {error || 'პროდუქცია ვერ მოიძებნა'}
        </Text>
      </View>
    )
  }
  ListFooterComponent={
    isLoading && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fc0" />
      </View>
    )
  }
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      colors={['#fc0']}
    />
  }
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bannersContainer: {
    marginVertical: 10,
  },
  bannersList: {
    height: 150,
  },
  bannerImage: {
    width: 350,
    height: 150,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  categoriesList: {
    paddingBottom: 8,
  },
  categoryItem: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#fc0',
  },
  categoryText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#333',
  },
  productsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  viewAllText: {
    color: '#fc0',
    fontWeight: 'bold',
  },
  productList: {
    paddingBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;