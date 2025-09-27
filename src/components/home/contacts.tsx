"use client";

import React from "react";
import { useState , useEffect} from "react";
import { SlLocationPin } from "react-icons/sl";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { FaUserEdit, FaUserCheck } from "react-icons/fa";
import { MdWifiCalling3 } from "react-icons/md";
import { MdAlternateEmail } from "react-icons/md";
const Contacts: React.FC = () => {

const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

useEffect(() => {
  }, []);

const handleSubscribe = (e: any) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };
  return (
    <>
    {/* Contact Details */}
    <div className="flex flex-col items-center justify-center  max-w-3xl mx-auto mb-12  sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold mb-4 relative inline-block pb-2 font-serif line-height-3">
            Get in Touch - Free to Reach Out
              <span className="absolute bottom-0 left-0 right-0 h-1.5 w-[50%] hover:w-full bg-gradient-to-r from-orange-500 to-pink-600 "></span>
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 font-mono">
                <SlLocationPin className="text-lg mt-0.5 text-orange-400 flex-shrink-0" />
                <p className="text-gray-400 hover:text-orange-400 transition-colors">
                  HOUSE NO 38, BLOCK 4, MOTI NAGAR, Ramesh Nagar, New Delhi- 110015
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <MdOutlineMarkEmailRead className="text-lg text-orange-400 flex-shrink-0" />
                <a
                  href="mailto:contact@100xdevs.com"
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                >
                  contact@100xdevs.com
                </a>
              </div>
              <div className="pt-4 flex flex-col gap-8 ">
               <h1 className="text-xl font-bold font-serif text-slate-400"> If Any Queries? Feel free to reach out. We are here to assist you!</h1>
                <div className="flex flex-cols-2 items-center justify-between font-mono">
                <div className="flex items-center gap-2 font-mono">
                <FaUserEdit className="text-2xl text-orange-400 flex-shrink-0" />
                <label htmlFor="">First Name:</label>
               <input type="text" name="name" id="" className="px-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-orange-500 text-gray-400 w-32" 
               placeholder="Ayush"/>

              </div>
              <div className="flex items-center gap-2 font-mono">
                <FaUserCheck className="text-2xl text-orange-400 flex-shrink-0" />
                <label htmlFor="">Last Name:</label>
               <input type="text" name="name" id="" className=" px-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-orange-500 text-gray-400 w-32 " 
               placeholder="Sahani"/>

              </div>
              </div>
              <div className="flex flex-cols-2 items-center justify-between font-mono">
               <div className="flex items-center gap-2 font-mono">
                <MdWifiCalling3 className="text-2xl text-orange-400 flex-shrink-0" />
                <label htmlFor="">Mobile Number:</label>
               <input type="tel" name="phone" id="" className="bg-transparent border-b border-gray-500 focus:outline-none focus:border-orange-500 text-gray-400 w-32 " 
               placeholder="+91 987654321"/>

              </div>
              <div className="flex items-center gap-3 font-mono">
                <MdAlternateEmail className="text-2xl text-orange-400 flex-shrink-0" />
                <label htmlFor="">Email-ID:</label>
               <input type="email" name="email" id="" aria-label="email" className="px-0.5 bg-transparent border-b border-slate-500 focus:outline-none focus:border-orange-500 text-gray-400 w-32 " 
               placeholder="email.@dev.com"/>

              </div>
              </div>
              <button type="button" className="text-white bg-orange-600 hover:bg-orange-400 focus:ring-2 focus:outline-none dark:focus:ring-red-600 rounded-lg text-xl px-3 py-2 text-center cursor-pointer font-extrabold">Submit</button>
            </div>
</div>
            <div className="w-full border-t border-gray-500 ">
              <p className="text-xl pt-6 text-center text-orange-400 mb-3">
                Subscribe to Our Community!
              </p>
              {subscribed ? (
                <div className="p-3 bg-green-900/30 border border-green-700/30 rounded-lg text-center text-green-300 text-sm">
                  Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your email address here"
                    className="w-full bg-stone-900/50 backdrop-blur-sm border border-stone-700/50 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400  focus:border-pink-600 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1 bg-gradient-to-r from-red-600 to-orange-400 hover:from-sky-600 hover:to-sky-300 corsur-pointer text-white py-2 px-4 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 cursor-pointer font-semibold"
                  >
                   Touch Now
                  </button>
                </form>
              )}
            
            </div>
            </div>
</>
  );
}

export default Contacts;