import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, logoutUserFailure, logoutUserStart, logoutUserSuccess, updateUserFailure, updateUserStart, updateUserSuccess } from '../redux/user/userSlice'

export default function Profile() {
const { currentUser, loading, error } = useSelector(state => state.user)
const fileRef = useRef(null)
const [file, setFile] = useState(undefined)
const [filePercent, setFilePercent] = useState(0)
const [fileUploadError, setFileUploadError] = useState(false)
const [formData, setFormData] = useState({})
const dispatch = useDispatch()
const [updateSuccess, setUpdateSuccess] = useState(false)
/*console.log(file)
console.log(filePercent)
console.log(formData)
console.log(fileUploadError)*/

//firebase storage
/*allow read;
allow write: if 
request.resource.size < 2 * 1024 * 1024 &&
request.resource.contentType.matches('image/.*')*/

useEffect(() => {
  if (file) {
    handleFileUpload(file)
  }
}, [file])

const handleFileUpload = (file) => {
  const storage = getStorage(app)
  const fileName = new Date().getTime() + file.name
  const storageRef = ref(storage, fileName)
  const uploadTask = uploadBytesResumable(storageRef, file)

  uploadTask.on('state_changed', 
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / 
    snapshot.totalBytes) * 100
    //console.log('upload is ' + progress + '% done')
    setFilePercent(Math.round(progress))
  },
  (error) => {
    setFileUploadError(true)
  },
  () => {
    getDownloadURL(uploadTask.snapshot.ref)
      .then((downloadURL) => 
        setFormData({...formData, avatar: downloadURL})
      )
  }
  )
}

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      dispatch(updateUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      const data = res.json()
      if (data.success === false) {
        dispatch(updateUserFailure(data.message))
        return;
      }
      dispatch(updateUserSuccess(data))
      setUpdateSuccess(true)
    } catch (error) {
      dispatch(updateUserFailure({error: error.message}))
    }
  }

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'DELETE'})
      const data = await res.json()
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message))
        return;
      }
      dispatch(deleteUserSuccess(data))
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleLogout = async () => {
    try {
      dispatch(logoutUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`)
      const data = await res.json()
      if (data.success === false) {
        dispatch(logoutUserFailure(data.message))
        return;
      }
      dispatch(logoutUserSuccess(data))
    } catch (error) {
      dispatch(logoutUserFailure(error.message))
    }
  }

  return (
    <div className='max-w-lg mx-auto p-3'>
      <h1 className='text-center font-semibold text-3xl my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept='image/*' />
        <img onClick={() => fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' />
        <p className='text-sm self-center'>
          {fileUploadError ? <span className='text-red-700'>Error uploading image(image must be less than 2mb)</span> : 
          filePercent > 0 && filePercent < 100 ? (
          <span className='text-slate-700'>{`Uploading...${filePercent}%`}</span>) : 
          filePercent === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          ) }
        </p>
        <input type="email" placeholder='email' defaultValue={currentUser.email}  className='border p-3 rounded-lg' onChange={handleChange} id='email' />        
        <input type="text" placeholder='username' defaultValue={currentUser.username} className='border p-3 rounded-lg' onChange={handleChange} id='username' />
        <input type="password" placeholder='password' className='border p-3 rounded-lg' onChange={handleChange} id='password' />
        <button disabled={loading}type="submit" className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-90 disabled:opacity-80'>{loading ? 'loading...' : 'update'}</button>
        <Link to='/create-listing' className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-90'>
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleLogout} className='text-red-700 cursor-pointer'>Logout</span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error.message : ''}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? 'User successfully updated!' : ''}</p>
    </div>
  )
}
