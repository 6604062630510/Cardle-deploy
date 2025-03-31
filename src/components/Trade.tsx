import { useState, useEffect } from 'react';
import { supabase } from '../database/client';
import CardFactory from './CardFactory';
import { TradeCardProps } from './Interface/CardProps';
import { useNavigate} from 'react-router-dom';


const Trade = () => {
  const [products, setProducts] = useState<TradeCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [noPostsFound, setNoPostsFound] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [hashtagIHave, setHashtagIHave] = useState<string>('');
    const [hashtagIWant, setHashtagIWant] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');
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
            .from('Posts-trade')
            .select(
              `id_post,
               created_at,
               title,
               type,
               flaw,
               hashtag_i_have,
               hashtag_i_want,
               description_i_have,
               description_i_want,
               post_img_i_have,
               post_img_i_want,
               has_want,
               status,
              Users:by_userid(acc_name, username, status)`
        )
        .eq("status", "posted")
        
            .order('created_at', { ascending: false });
          if (filterType === 'hashtag') {
            if (hashtagIHave || hashtagIWant) {
                if (hashtagIHave && hashtagIWant) {
                    query = query
                      .contains('hashtag_i_have', [hashtagIHave])
                      .contains('hashtag_i_want', [hashtagIWant]);
                  } else if (hashtagIHave) {
                    query = query.contains('hashtag_i_have', [hashtagIHave]);
                  } else if (hashtagIWant) {
                    query = query.contains('hashtag_i_want', [hashtagIWant]);
                  }
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

            const approvedData = data.filter((product: any) => product.Users?.status === "approved");

            
            setProducts(
              approvedData.map((product: any) => ({
                type: 'trade',
                id_post: product.id_post,
                title: product.title,
                description: product.description_i_have,
                image: product.post_img_i_have?.[0],
                username: product.Users?.username || 'ไม่ระบุชื่อผู้โพสต์',
                acc_name: product.Users?.acc_name || 'ไม่ระบุชื่อผู้โพสต์',
                created_at: product.created_at,
                hashtags: product.hashtag_i_have || [],
                hashtags_want: product.hashtag_i_want || [],
                has_want: product.has_want,
                isFavorite: isFavorite(product.id_post),
                onToggleFavorite: (id_post: number) => onToggleFavorite(id_post), 
              })));
          }
    
          setLoading(false);
        };

    fetchProducts();
  }, [currentUser, searchTerm, filterType, hashtagIHave, hashtagIWant]);


  const onToggleFavorite = async (id_post: number) => {
    if (!currentUser) {
        navigate("/signin")
      return;
    }
    let favPosts: number[] = currentUser.fav_post_trade || [];

    if (favPosts.includes(id_post)) {

      favPosts = favPosts.filter((item) => item !== id_post);

    } else {
      favPosts.push(id_post);

    }
    const { error } = await supabase
      .from('Users')
      .update({ fav_post_trade: favPosts })
      .eq('id', currentUser.id);

    if (error) {
      console.error('Error updating favorites:', error.message);
      alert('เกิดข้อผิดพลาดในการอัปเดตรายการโปรด');
    } else {

      // อัปเดต state และ localStorage
      const updatedUser = { ...currentUser, fav_post_trade: favPosts };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const isFavorite = (id_post: number) => {
    if (!currentUser) return false;
    const favPosts: number[] = currentUser.fav_post_trade || [];
    return favPosts.includes(id_post);
  };

  return (
    <div className="container mt-5">
      <h1 className="ms-md-5 custom-topic">Trade</h1>
  {/* ฟอร์มค้นหา */}
  <div className="search-bar mb-2 ms-md-5 me-md-5">
    {/* Radio Buttons สำหรับเลือกประเภทการค้นหา */}
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
      <div className="ms-auto">
        <p className="text-muted fs-6">แท็กสีเทา = การ์ดที่ผู้โพสต์มี | แท็กสีฟ้า = การ์ดที่ผู้โพสต์ตามหา</p>
        </div>
    </div>

    {/* ช่องค้นหา */}
    {filterType !== 'hashtag' && (
      <input
        type="text"
        className="form-control mt-2"
        placeholder="คุณกำลังมองหาอะไร"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    )}

    {/* ค้นหาด้วย Hashtag */}
    {filterType === 'hashtag' && (
      <div className="mt-3">
        <input
          type="text"
          className="form-control mt-2"
          placeholder="แท็กการ์ดที่คุณกำลังตามหา (เช่น Blackpink)"
          value={hashtagIHave}
          onChange={(e) => setHashtagIHave(e.target.value)}
        />
        <input
          type="text"
          className="form-control mt-2"
          placeholder="แท็กการ์ดที่คุณมี (เช่น nct)"
          value={hashtagIWant}
          onChange={(e) => setHashtagIWant(e.target.value)}
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

export default Trade;
