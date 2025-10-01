import React from "react";


function LoadingPage(){
    return(
        <div className="loading-container">
            <span className="loader"></span>
            <div className="text-loading">Fetching Data...</div>
        </div>
    )
}

export default LoadingPage;