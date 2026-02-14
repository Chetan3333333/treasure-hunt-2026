import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Admin = () => {
    return (
        <div className="p-10 text-white">
            <h1 className="text-4xl font-bold mb-4">Admin Debug Mode</h1>
            <p>If you can see this, the page is rendering.</p>
            <Button onClick={() => alert("Interactivity Works")}>Test Button</Button>
        </div>
    );
};

export default Admin;
