import axios from 'axios'
import React, { useEffect } from 'react'
import { useState } from 'react'


export const GetApiDemo = () => {

   const [user, setUser] = useState([])

   const getUsers = async () => {

      const response = await axios.get("https://node5.onrender.com/user/user/")
      console.log("response...,response")
      console.log("response data...,response.data")
      setUser(response.data.data)

   }
   useEffect(() => {
      getUsers()
   }, [])

   return (
      <div style={{ textAlign: "center" }}>
         <h1>GetApiDemo</h1>
         {/* <button onClick={getUsers}>Get Users</button> */}
         <table className="table-auto w-full border-2 border-slate-700 border-collapse mt-6 text-center bg-slate-800 text-white rounded-lg shadow-lg overflow-hidden ">
            <thead>
               <tr>
                  <th className='border border-gray-300 p-5'>ID</th>
                  <th className='border border-gray-300 p-5'>Name</th>
                  <th className='border border-gray-300 p-5'>Email</th>

               </tr>
            </thead>
            <tbody>
               {user.map(user => (
                  <tr key={user._id}>
                     <td className='border border-gray-300 p-3'>{user._id}</td>
                     <td className='border border-gray-300 p-3'>{user.name}</td>
                     <td className='border border-gray-300 p-3'>{user.email}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   )
}