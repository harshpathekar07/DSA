class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> count(256, -1);
        int lp = 0,  rp =0, len=0 , n=s.size();
        while(rp<n){
            if (count[s[rp]]!=-1){
                if (count[s[rp]]>=lp){
                    lp=count[s[rp]]+1;
                }
            }
            count[s[rp]] = rp;
            len=max(len,rp-lp+1);
            rp++;
        }   
        return len;   
    }
};