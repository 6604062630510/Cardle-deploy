import { useState, useEffect } from 'react';
import { supabase } from '../database/client';
import CardFactory from './CardFactory';
import { SellCardProps } from './Interface/CardProps';
import { useNavigate} from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState<SellCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hashtag, setHashtag] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [noPostsFound, setNoPostsFound] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    console.log("Current User: ", storedUser);
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      
    }
  }, []);


    useEffect(() => {
      const fetchProducts = async () => {
        setLoading(true);
        setNoPostsFound(false);
  
        let query = supabase
          .from('Posts-sell')
          .select(
            `id_post,
             created_at,
             title,
             type,
             flaw,
             hashtag,
             description,
             price,
             post_img,
             status,
             Users:by_userid(acc_name, username)`
          )
          .order('created_at', { ascending: false });
  
        if (filterType === 'hashtag') {

          if (hashtag) {
                  query = query.contains('hashtag', [hashtag]);
  
          } else {

            setProducts([]);
            setNoPostsFound(true);
            setLoading(false);
            return;
          }
        } else if (searchTerm) {

          if (filterType === 'title') {
            query = query.ilike('title', `%${searchTerm}%`);
          } else if (filterType === 'acc_name') {
            const { data: users } = await supabase
              .from('Users')
              .select('id')
              .ilike('acc_name', `%${searchTerm}%`);
  
            if (users && users.length > 0) {
              const userIds = users.map(user => user.id);
              query = query.in('by_userid', userIds);
            } else {
              setNoPostsFound(true);
              setLoading(false);
              return;
            }
          } else {
            query = query.ilike('title', `%${searchTerm}%`);
          }
        }
  
        const { data, error } = await query;
  
        if (error) {
          console.error("Error fetching products:", error.message);
        } else {
          if (data && data.length === 0) {
            setNoPostsFound(true);
          }
          setProducts( data?.map((product: any) => ({
            type: 'sell',
            id_post: product.id_post,
            title: product.title,
            description: product.description,
            image: product.post_img[0],
            username: product.Users?.username || 'ไม่ระบุชื่อผู้โพสต์',
            acc_name: product.Users?.acc_name || 'ไม่ระบุชื่อผู้โพสต์',
            created_at: product.created_at,
            hashtags: product.hashtag || [],
            price: product.price,
            isFavorite: isFavorite(product.id_post),
            onToggleFavorite: (id_post: number) => onToggleFavorite(id_post),
          })));
        }
  
        setLoading(false);
      };
  
      fetchProducts();
    }, [currentUser, searchTerm, filterType, hashtag]);

  const onToggleFavorite = async (id_post: number) => {
    if (!currentUser) {
        navigate("/signin")
      return;
    }
    let favPosts: number[] = currentUser.fav_post_sell || [];

    if (favPosts.includes(id_post)) {
      favPosts = favPosts.filter((item) => item !== id_post);

    } else {
      favPosts.push(id_post);

    }
    const { error } = await supabase
      .from('Users')
      .update({ fav_post_sell: favPosts })
      .eq('id', currentUser.id);

    if (error) {
      console.error('Error updating favorites:', error.message);
      alert('เกิดข้อผิดพลาดในการอัปเดตรายการโปรด');
    } else {

      const updatedUser = { ...currentUser, fav_post_sell: favPosts };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const isFavorite = (id_post: number) => {
    if (!currentUser) return false;
    const favPosts: number[] = currentUser.fav_post_sell || [];
    return favPosts.includes(id_post);
  };

  return (
    <div className="container mt-5">
      <h1 className="ms-md-5 custom-topic">Shop</h1>
  <div className="search-bar mb-2 ms-md-5 me-md-5">
    <div className="mt-2 d-flex">
      <label className="me-3">
        <input
          type="radio"
          name="filterType"
          value="title"
          checked={filterType === 'title'}
          onChange={(e) => setFilterType(e.target.value)}
          className="me-2"
        />
        ค้นหาจากชื่อโพสต์
      </label>
      <label className="me-3">
        <input
          type="radio"
          name="filterType"
          value="acc_name"
          checked={filterType === 'acc_name'}
          onChange={(e) => setFilterType(e.target.value)}
          className="me-2"
        />
        ค้นหาจากชื่อผู้โพสต์
      </label>
      <label>
        <input
          type="radio"
          name="filterType"
          value="hashtag"
          checked={filterType === 'hashtag'}
          onChange={(e) => setFilterType(e.target.value)}
          className="me-2"
        />
        ค้นหาจาก hashtag
      </label>
    </div>

    {filterType !== 'hashtag' && (
      <input
        type="text"
        className="form-control mt-2"
        placeholder="คุณกำลังมองหาอะไร"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    )}

    {filterType === 'hashtag' && (
      <div className="mt-3">
        <input
          type="text"
          className="form-control mt-2"
          placeholder="แท็กการ์ดที่คุณกำลังตามหา (เช่น Blackpink)"
          value={hashtag}
          onChange={(e) => setHashtag(e.target.value)}
        />
      </div>
      
      
    )}

  </div>
      {loading ? (
        <p className="text-center mt-5">กำลังโหลด...</p>
      ) : noPostsFound ? (
        <p className="text-center mt-5">ไม่พบโพสต์ที่ตรงกับการค้นหานี้</p>
      ) : (
        <div className="row">
          {products.map((product) => (
            <CardFactory key={product.id_post} {...product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
