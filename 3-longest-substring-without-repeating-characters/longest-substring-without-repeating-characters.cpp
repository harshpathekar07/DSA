class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> map(256, -1);
        int left = 0;
        int maxlen = 0;
        for (int i = 0 ; i<s.size(); i++){
            char j = s[i];
            if (map[j]!=-1){
                left = max(left,map[j]+1);
            } 
            map[j]=i;
            maxlen=max(maxlen,i-left+1);
        }
        return maxlen;
    }
};