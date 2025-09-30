import React from "react";


function LoadingPage(){
    return(
        <div className="loading-container">
            <span class="loader"></span>
            <div className="text-loading">Fetching Data...</div>
        </div>
    )
}

export default LoadingPage;