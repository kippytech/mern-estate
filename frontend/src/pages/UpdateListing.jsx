import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import React, { useEffect, useState } from 'react'
import { app } from '../firebase'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

export default function CreateListing() {
  const [files, setFiles] = useState([])
  const [formData, setFormData] = useState({ 
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 0,
    discountedPrice: 0,
    offer: false,
    parking: false,
    furnished: false
 })
  const [imageUploadError, setImageUploadError] =useState(false)
  const [uploading, setUploading] = useState(false)  
  const [error, setError] = useState(false)  
  const [loading, setLoading] = useState(false)
  const { currentUser } =useSelector((state) => state.user)
  const navigate = useNavigate()
  const params = useParams()

  useEffect(() => {
    const fetchListing = async () => {
        const listingId = params.listingId
        const res = await fetch(`/api/listing/get/${listingId}`)
        const data = await res.json()
        
        if (data.success === false) {
            console.log(data.message)
            return;
        }
        setFormData(data)
    } 
    fetchListing()
    }, [])
   
  
  console.log(formData)
  console.log(files)
  console.log(uploading)
  console.log(imageUploadError)

 /* const handleImageSubmit = async () => {
    try {
      if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
        setUploading(true);
        setImageUploadError(false);
  
        const promises = files.map((file) => storeImage(file));
        const urls = await Promise.all(promises);
  
        setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });
        setImageUploadError(false);
        setUploading(false);
      } else if (files.length === 0) {
        setImageUploadError('You have not uploaded any image!');
        setUploading(false);
      } else {
        setImageUploadError('You can only upload 6 images per listing');
        setUploading(false);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      setImageUploadError('Image upload failed (2mb max per image)');
      setUploading(false);
    }
  };*/
  

  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.lentgth < 7) {
        setUploading(true)
        setImageUploadError(false)
        const promises = []

        for (let i = 0; i < files.length; i++) {
            promises.push(storeImage(files[i]))
        }
        Promise.all(promises).then((urls) => {
            setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls ) })
            setImageUploadError(false)
            setUploading(false)
        }) .catch ((err) => {
            setImageUploadError('Image upload failed (2mb max per image)')
        })
    } 
    else if(files.length === 0) {
        setImageUploadError('You have not uploaded any image!')
        setUploading(false)
    } else {
        setImageUploadError('You can only upload 6 images per listing')
        setUploading(false)
        console.log('couldnt manage')
    }
  }

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
        const storage = getStorage(app)
        const fileName = new Date().getTime() + file.name
        const storageRef = ref(storage, fileName)
        const uploadTask = uploadBytesResumable(storageRef, file)
        uploadTask.on("state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log(`upload is ${progress}% done`)
            console.log('upload is ' + progress + '% done')
          },
          (error) => {
            reject(error)
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL)
            })
          })
    })
  }

  const handleRemoveImage = (index) => {
    setFormData({
        ...formData, imageUrls: formData.imageUrls.filter((_, i) => {
            i !== index
        })
    })
  }

  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
      ...formData, type: e.target.id 
      })
    }

    if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
      setFormData({
      ...formData, [e.target.id]: e.target.checked 
      })
    }

    if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
      setFormData({
      ...formData, [e.target.id]: e.target.value 
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
        /*if (formData.imageUrls.length < 1) {
            return setError('You must upload at least 1 image!')
        }*/
        if (+formData.regularPrice < +formData.discountedPrice) {
            return setError('Discount price must be lower than regular price!')
        }
        setLoading(true)
        setError(false)
        const res = await fetch(`/api/listing/update/${params.listingId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...formData, userRef: currentUser._id })
        })
        const data = await res.json()
        setLoading(false)
        if (data.success === false) {
            setError(data.message)
        }
        navigate(`/listing/${data._id}`)
    } catch (error) {
        setError(error.message)
        setLoading(false)
    }
  }

  return (
    <main className='max-w-4xl mx-auto p-3'>
        <h1 className='text-3xl font-semibold text-center my-7'>Update a listing</h1>
        <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
            <div className='flex flex-col gap-4 flex-1'>
              <input value={formData.name} onChange={handleChange} type="text" placeholder='Name' className='border p-3 rounded-lg' id='name' maxLength={62} minLength={10} required />
              <textarea value={formData.description} onChange={handleChange} type="text" placeholder='Description' className='border p-3 rounded-lg' id='description' required />
              <input value={formData.address} onChange={handleChange} type="text" placeholder='Address' className='border p-3 rounded-lg' id='address' required />
              <div className='flex gap-6 flex-wrap'>
                <div className='flex gap-2'>
                    <input checked={formData.type === 'sale'} onChange={handleChange} type="checkbox" id='sale'className='w-5' />
                    <span>Sell</span>
                </div>
                <div className='flex gap-2'>
                    <input checked={formData.type === 'rent'} onChange={handleChange} type="checkbox" id='rent'className='w-5' />
                    <span>Rent</span>
                </div>
                <div className='flex gap-2'>
                    <input checked={formData.parking} onChange={handleChange} type="checkbox" id='parking'className='w-5' />
                    <span>Parking spot</span>
                </div>
                <div className='flex gap-2'>
                    <input checked={formData.furnished} onChange={handleChange} type="checkbox" id='furnished'className='w-5' />
                    <span>Furnished</span>
                </div>
                <div className='flex gap-2'>
                    <input checked={formData.offer} onChange={handleChange} type="checkbox" id='offer'className='w-5' />
                    <span>Offer</span>
                </div>
              </div>
              <div className='flex flex-wrap gap-6'>
                <div className='flex items-center gap-2'>
                    <input value={formData.bedrooms} onChange={handleChange} className='border border-gray-300 p-3 rounded-lg' type="number" id='bedroom' min={1} max={15} required />
                    <p>Beds</p>
                </div>
                <div className='flex items-center gap-2'>
                    <input value={formData.bathrooms} onChange={handleChange} className='border border-gray-300 p-3 rounded-lg' type="number" id='bathroom' min={1} max={15} required />
                    <p>Bathrooms</p>
                </div>
                <div className='flex items-center gap-2'>
                    <input value={formData.regularPrice} onChange={handleChange} className='border border-gray-300 p-3 rounded-lg' type="number" id='regularPrice' min={1} max={1000000000} required />
                    <div className='flex flex-col items-center'>
                      <p>Regular Price</p>
                      <span className='text-xs'>(Ksh. / Month)</span>
                    </div>
                </div>
                { formData.offer && (
                <div className='flex items-center gap-2'>
                <input value={formData.discountedPrice} onChange={handleChange} className='border border-gray-300 p-3 rounded-lg' type="number" id='discountedPrice' min={1} max={1000000000} required />
                <div className='flex flex-col items-center'>
                  <p>Discounted Price</p>
                  <span className='text-xs'>(Ksh. / Month)</span>
                </div>
            </div>                
                )
                }
              </div>
            </div>
            <div className='flex flex-col gap-4 flex-1'>
                <p className='font-semibold'>Images: 
                  <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
                </p>
                <div className='flex gap-4'>
                    <input onChange={(e) => setFiles(e.target.files)} className='p-3 border-gray-300 w-full rounded' type="file" id='images' accept='image/*' multiple />
                    <button disabled={uploading} onClick={handleImageSubmit} className='p-3 text-green-700 border-green-700 border rounded uppercase hover:shadow-lg disabled:opacity-80' type="button">{ uploading ? 'uploading...' : 'upload' }</button>
                </div>
                <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>
                {
                    formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
                        <div key={url} className='flex justify-between p-3 border items-center'>
                            <img src="url" alt="listing-image" className='w-20 h-20 object-contain rounded-lg' />
                            <button onClick={() => handleRemoveImage(index)} className='p-3 text-red-700 rounded-lg uppercase hover:opacity-80' type="button">Delete</button>
                        </div>
                    ))
                }
                <button disabled={loading || uploading } className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-90 disabled:opacity-80' type="submit">
                  {loading ? 'Updating...' : 'Update Listing' }
                </button>
                {error && <p className='text-red-700'>{error}</p>}
            </div>                        
        </form>
    </main>
  )
}

