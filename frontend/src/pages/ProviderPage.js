const user = auth.currentUser;

const [profile , setProfile] = useState({
    full_name: '',
    phone: '',
    city: '',
    province: '',


});

const [loading, setLoading] = useState(true);
const [messsage, setMessage] = useState('');